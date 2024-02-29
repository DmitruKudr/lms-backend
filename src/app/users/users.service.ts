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

  public async findAllUsers() {
    return (await this.prisma.user.findMany({
      where: { UserRole: { type: { not: UserRoleTypesEnum.Admin } } },
      include: { UserRole: { select: { title: true, type: true } } },
    })) as UserWithRole[];
  }

  public async findAllAdmins() {
    return (await this.prisma.user.findMany({
      where: { UserRole: { type: UserRoleTypesEnum.Admin } },
      include: { UserRole: { select: { title: true, type: true } } },
    })) as UserWithRole[];
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
