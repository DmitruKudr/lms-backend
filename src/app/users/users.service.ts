import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateDefaultUserForm } from './dtos/create-default-user.form';
import { CreateSpecialUserForm } from './dtos/create-special-user.form';
import { BaseStatusesEnum, UserRoleTypesEnum } from '@prisma/client';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { UserWithRole } from './types/user-with-role.interface';
import { UserRolesService } from '../user-roles/user-roles.service';
import { UserQueryDto } from './dtos/user-query.dto';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';

type CreateUserForms = CreateDefaultUserForm | CreateSpecialUserForm;
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private userRolesService: UserRolesService,
  ) {}

  public async createUser(form: CreateUserForms) {
    await this.doesUserExist(form.email);

    const role = await this.userRolesService.findRoleWithTitle(form.roleTitle);
    if (role.type === UserRoleTypesEnum.Admin) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidRole + role.title,
      });
    }

    const preparedForm = await CreateDefaultUserForm.beforeCreation(form);
    const newModel = await this.prisma.user.create({
      data: {
        ...preparedForm,
        username: await this.generateUsername(preparedForm.name),
        roleId: role.id,
      },
    });
    await this.prisma[role.type].create({ data: { id: newModel.id } });

    return {
      ...newModel,
      UserRole: {
        title: role.title,
        type: role.type,
      },
    } as UserWithRole;
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
    })) as UserWithRole[];

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
    })) as UserWithRole[];

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
        data: { status: BaseStatusesEnum.Active },
        include: { UserRole: { select: { title: true, type: true } } },
      })) as UserWithRole;
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
      })) as UserWithRole;
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'user',
      });
    }
  }

  // ===== shared methods =====
  public async doesUserExist(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email },
    });
    if (user) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.UserAlreadyExists,
      });
    }

    return user;
  }

  public async generateUsername(name: string) {
    const username = name.toLowerCase().split(' ').join('');
    const users = await this.prisma.user.findMany({
      where: { username: { contains: username } },
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
}
