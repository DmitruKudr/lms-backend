import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  BaseStatusesEnum,
  UserRolePermissionsEnum,
  UserRoleTypesEnum,
} from '@prisma/client';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { IUserModel } from './types/user-model.interface';
import { UserRolesService } from '../user-roles/user-roles.service';
import { UserQueryDto } from './dtos/user-query.dto';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { hash, verify } from 'argon2';
import { TCreateUserForms } from './types/create-user-forms.type';
import { PayloadAccessDto } from '../security/dtos/payload-access.dto';
import { difference } from 'lodash';
import { ChangeEmailForm } from './dtos/change-email.form';
import { ChangePasswordForm } from './dtos/change-password-form';
import { ChangeUsernameForm } from './dtos/change-username.form';
import { IFileValue } from '../../shared/types/file-value.interface';
import { FilesService } from '../files/files.service';
import { FileTypesEnum } from '../../shared/enums/file-types.enum';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private userRolesService: UserRolesService,
    private filesService: FilesService,
  ) {}

  public async create(form: TCreateUserForms) {
    await this.doesActiveUserAlreadyExist({ email: form.email });

    const role = await this.userRolesService.findRoleWithTitle(form.roleTitle);
    if (role.type === UserRoleTypesEnum.Admin) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.NotAdminRole + role.title,
      });
    }

    return (await this.prisma.user.create({
      data: {
        name: form.name,
        username: await this.generateUsername(form.name),
        email: form.email,
        password: await hash(form.password),
        roleId: role.id,
        [role.type]: { create: {} },
      },
      include: { UserRole: true },
    })) as IUserModel;
  }

  public async findActiveUsers(query: UserQueryDto) {
    const take = query.pageSize || 10;
    const skip = ((query.pageNumber || 1) - 1) * take;

    console.log(query);

    const models = (await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query.queryLine } },
          { username: { contains: query.queryLine } },
        ],
        status: BaseStatusesEnum.Active,
        UserRole: {
          AND: [
            query.roleType ? { type: query.roleType } : {},
            { type: { not: UserRoleTypesEnum.Admin } },
          ],
        },
      },
      include: { UserRole: true },
      take: take,
      skip: skip,
    })) as IUserModel[];

    let remaining = await this.prisma.user.count({
      where: {
        OR: [
          { name: { contains: query.queryLine } },
          { username: { contains: query.queryLine } },
        ],
        status: BaseStatusesEnum.Active,
        UserRole: {
          AND: [
            query.roleType ? { type: query.roleType } : {},
            { type: { not: UserRoleTypesEnum.Admin } },
          ],
        },
      },
    });
    remaining -= take + skip;

    return remaining > 0 ? { models, remaining } : { models, remaining: 0 };
  }

  public async findAllAdmins(query: BaseQueryDto) {
    const take = query.pageSize || 10;
    const skip = ((query.pageNumber || 1) - 1) * take;

    const models = (await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query.queryLine } },
          { username: { contains: query.queryLine } },
          { email: { contains: query.queryLine } },
        ],
        UserRole: { type: UserRoleTypesEnum.Admin },
      },
      include: { UserRole: true },
      take: take,
      skip: skip,
    })) as IUserModel[];

    let remaining = await this.prisma.user.count({
      where: {
        OR: [
          { name: { contains: query.queryLine } },
          { username: { contains: query.queryLine } },
          { email: { contains: query.queryLine } },
        ],
        UserRole: { type: UserRoleTypesEnum.Admin },
      },
    });
    remaining -= take + skip;

    return remaining > 0 ? { models, remaining } : { models, remaining: 0 };
  }

  public async changeActiveUsernameWithId(
    id: string,
    form: ChangeUsernameForm,
    currentUser: PayloadAccessDto,
  ) {
    this.isCurrentUser(currentUser, id);
    await this.doesActiveUserAlreadyExist({
      username: form.username,
    });

    try {
      return (await this.prisma.user.update({
        where: { id: id, status: BaseStatusesEnum.Active },
        data: {
          email: form.username,
        },
        include: { UserRole: true },
      })) as IUserModel;
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + `user with id - ${id}`,
      });
    }
  }

  public async changeActiveEmailWithId(
    id: string,
    form: ChangeEmailForm,
    currentUser: PayloadAccessDto,
  ) {
    this.isCurrentUser(currentUser, id);
    await this.doesActiveUserAlreadyExist({
      email: form.email,
    });

    try {
      return (await this.prisma.user.update({
        where: { id: id, status: BaseStatusesEnum.Active },
        data: {
          email: form.email,
        },
        include: { UserRole: true },
      })) as IUserModel;
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + `user with id - ${id}`,
      });
    }
  }

  public async changeActivePasswordWithId(
    id: string,
    form: ChangePasswordForm,
    currentUser: PayloadAccessDto,
  ) {
    this.isCurrentUser(currentUser, id);
    const user = await this.findActiveUser({ id: id });

    if (!(await verify(user.password, form.oldPassword))) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidOldPassword + form.oldPassword,
      });
    }

    return (await this.prisma.user.update({
      where: { id: id, status: BaseStatusesEnum.Active },
      data: {
        password: await hash(form.newPassword),
      },
      include: { UserRole: true },
    })) as IUserModel;
  }

  public async changeActiveAvatarWithId(
    id: string,
    avatar: IFileValue,
    currentUser: PayloadAccessDto,
  ) {
    this.isCurrentUser(currentUser, id);
    const user = await this.findActiveUser({ id: id });

    const newAvatarPath = await this.filesService.tempReplaceFile(
      avatar,
      user.avatar && `${FileTypesEnum.Avatar}/${user.avatar}`,
    );

    return (await this.prisma.user.update({
      where: { id: id, status: BaseStatusesEnum.Active },
      data: {
        avatar: newAvatarPath,
      },
      include: { UserRole: true },
    })) as IUserModel;
  }

  public async activateWithId(id: string) {
    try {
      return (await this.prisma.user.update({
        where: { id: id },
        data: {
          status: BaseStatusesEnum.Active,
          name: 'Activated User',
          username: await this.generateUsername('Activated User'),
        },
        include: { UserRole: true },
      })) as IUserModel;
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + `user with id - ${id}`,
      });
    }
  }

  public async archiveWithId(id: string) {
    const user = await this.findActiveUser({ id: id });
    await this.filesService.tempDeleteFile(
      user.avatar && `${FileTypesEnum.Avatar}/${user.avatar}`,
    );

    return (await this.prisma.user.update({
      where: { id: id },
      data: {
        status: BaseStatusesEnum.Archived,
        email: null,
        username: await this.generateUsername('Archived User'),
        avatar: null,
      },
      include: { UserRole: true },
    })) as IUserModel;
  }

  // ===== shared methods =====

  public async findActiveUser(
    options: Partial<{
      id: string;
      email: string;
      roleType: UserRoleTypesEnum;
      permissions: UserRolePermissionsEnum[];
    }>,
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: options.id }, { email: options.email }],
        status: BaseStatusesEnum.Active,
        UserRole: {
          AND: [
            options.roleType ? { type: options.roleType } : {},
            { type: { not: UserRoleTypesEnum.Admin } },
          ],
        },
      },
      include: { UserRole: true },
    });

    if (!user) {
      throw new BadRequestException({
        statusCode: 404,
        message:
          ErrorCodesEnum.NotFound +
          `user with ${Object.entries(options)
            .map(([key, value]) => `${key} - ${value}`)
            .join(' ')}`,
      });
    }
    if (options?.permissions?.length) {
      const lackingPermissions = difference(
        options.permissions,
        user.UserRole.permissions,
      );
      if (lackingPermissions.length) {
        throw new ForbiddenException({
          statusConde: 403,
          message: `${
            ErrorCodesEnum.NotEnoughPermissions
          }${lackingPermissions.join(', ')} for ${
            user.UserRole.type
          } with id - ${user.id}`,
        });
      }
    }

    return user as IUserModel;
  }

  public async doesActiveUserAlreadyExist(
    options: Partial<{ email: string; username: string }>,
  ) {
    if (!options.email && !options.username) {
      return true;
    }

    const user = (await this.prisma.user.findFirst({
      where: {
        OR: [{ email: options.email }, { username: options.username }],
        status: BaseStatusesEnum.Active,
      },
      include: { UserRole: true },
    })) as IUserModel;
    if (user) {
      throw new BadRequestException({
        statusCode: 400,
        message:
          ErrorCodesEnum.UserAlreadyExists +
          (user.email === options.email ? options.email : options.username),
      });
    }

    return user;
  }

  public async generateUsername(name: string) {
    const username = name.toLowerCase().split(' ').join('');
    const users = await this.prisma.user.findMany({
      where: {
        username: { contains: username },
        status: BaseStatusesEnum.Active,
      },
    });

    if (users.length) {
      const tails: number[] = [];
      for (let i = 0; i < users.length; i++) {
        const tail = Number(users[i].username.split(username)[1]);
        isNaN(tail)
          ? tails.push(tails.sort((a, b) => b - a)[0])
          : tails.push(tail);
      }

      return username + (tails.sort((a, b) => b - a)[0] + 1);
    }

    return username;
  }

  public isCurrentUser(currentUser: PayloadAccessDto, id: string) {
    if (
      currentUser.id !== id &&
      currentUser.roleType !== UserRoleTypesEnum.Admin
    ) {
      throw new ForbiddenException({
        statusCode: 403,
        message: ErrorCodesEnum.NotCurrentUser,
      });
    }

    return currentUser;
  }
}
