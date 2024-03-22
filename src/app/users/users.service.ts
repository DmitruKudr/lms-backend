import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { BaseStatusesEnum, UserRoleTypesEnum } from '@prisma/client';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { IUserWithRole } from './types/user-with-role.interface';
import { UserRolesService } from '../user-roles/user-roles.service';
import { UserQueryDto } from './dtos/user-query.dto';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { hash } from 'argon2';
import { TCreateUserForms } from './types/create-user-forms.type';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private userRolesService: UserRolesService,
  ) {}

  public async create(form: TCreateUserForms) {
    await this.doesUserExist(form.email);

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
    } as IUserWithRole;
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
    })) as IUserWithRole[];

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
    })) as IUserWithRole[];

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
      })) as IUserWithRole;
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
      })) as IUserWithRole;
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'user',
      });
    }
  }

  // ===== shared methods =====
  public async doesUserExist(email: string) {
    const user = (await this.prisma.user.findUnique({
      where: { email: email },
      include: { UserRole: { select: { title: true, type: true } } },
    })) as IUserWithRole;
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
