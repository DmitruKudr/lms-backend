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
import { hash } from 'argon2';
import { TCreateUserForms } from './types/create-user-forms.type';
import { PayloadAccessDto } from '../security/dtos/payload-access.dto';
import { difference } from 'lodash';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private userRolesService: UserRolesService,
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

    const newModel = await this.prisma.user.create({
      data: {
        name: form.name,
        username: await this.generateUsername(form.name),
        email: form.email,
        password: await hash(form.password),
        roleId: role.id,
        [role.type]: { create: {} },
      },
    });

    return {
      ...newModel,
      UserRole: {
        title: role.title,
        type: role.type,
      },
    } as IUserModel;
  }

  public async findActiveUsers(query: UserQueryDto) {
    const take = query.pageSize || 10;
    const skip = ((query.pageNumber || 1) - 1) * take;

    const models = (await this.prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query.queryLine } },
              { username: { contains: query.queryLine } },
            ],
          },
          { status: BaseStatusesEnum.Active },
          query.roleType ? { UserRole: { type: query.roleType } } : {},
          { UserRole: { type: { not: UserRoleTypesEnum.Admin } } },
        ],
      },
      include: { UserRole: { select: { title: true, type: true } } },
      take: take,
      skip: skip,
    })) as IUserModel[];

    let remaining = await this.prisma.user.count({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query.queryLine } },
              { username: { contains: query.queryLine } },
            ],
          },
          { status: BaseStatusesEnum.Active },
          query.roleType ? { UserRole: { type: query.roleType } } : {},
          { UserRole: { type: { not: UserRoleTypesEnum.Admin } } },
        ],
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
        AND: [
          {
            OR: [
              { name: { contains: query.queryLine } },
              { username: { contains: query.queryLine } },
              { email: { contains: query.queryLine } },
            ],
          },
          { UserRole: { type: UserRoleTypesEnum.Admin } },
        ],
      },
      include: { UserRole: { select: { title: true, type: true } } },
      take: take,
      skip: skip,
    })) as IUserModel[];

    let remaining = await this.prisma.user.count({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query.queryLine } },
              { username: { contains: query.queryLine } },
              { email: { contains: query.queryLine } },
            ],
          },
          { UserRole: { type: UserRoleTypesEnum.Admin } },
        ],
      },
    });
    remaining -= take + skip;

    return remaining > 0 ? { models, remaining } : { models, remaining: 0 };
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
        include: { UserRole: { select: { title: true, type: true } } },
      })) as IUserModel;
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'user',
      });
    }
  }

  public async archiveWithId(id: string) {
    try {
      return (await this.prisma.user.update({
        where: { id: id },
        data: { status: BaseStatusesEnum.Archived },
        include: { UserRole: { select: { title: true, type: true } } },
      })) as IUserModel;
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'user',
      });
    }
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
        AND: [
          { OR: [{ id: options.id }, { email: options.email }] },
          options.roleType ? { UserRole: { type: options.roleType } } : {},
          { status: BaseStatusesEnum.Active },
        ],
      },
      include: {
        UserRole: { select: { title: true, type: true, permissions: true } },
      },
    });

    if (!user) {
      throw new BadRequestException({
        statusCode: 404,
        message:
          ErrorCodesEnum.NotFound + `user ${Object.entries(options).join(' ')}`,
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
          }${lackingPermissions.join(', ')} for ${user.UserRole.type} with id ${
            user.id
          }`,
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
      include: { UserRole: { select: { title: true, type: true } } },
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
