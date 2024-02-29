import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserRoleForm } from './dtos/update-user-role.form';
import { PrismaService } from '../../prisma.service';
import { CreateUserRoleForm } from './dtos/create-user-role.form';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { BaseStatusesEnum } from '@prisma/client';

@Injectable()
export class UserRolesService {
  constructor(private prisma: PrismaService) {}
  public async create(form: CreateUserRoleForm) {
    const isTitleUnique = await this.prisma.userRole.findFirst({
      where: { title: form.title },
    });
    if (isTitleUnique) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.UniqueField + 'title',
      });
    }

    return this.prisma.userRole.create({ data: form });
  }

  public async findAll() {
    return this.prisma.userRole.findMany();
  }

  public async findWithId(id: string) {
    const model = await this.prisma.userRole.findUnique({
      where: { id: id },
    });

    if (!model) {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'user role',
      });
    }

    return model;
  }

  public async updateWithId(id: string, form: UpdateUserRoleForm) {
    const isTitleUnique = await this.prisma.userRole.findUnique({
      where: { title: form.title },
    });
    if (isTitleUnique) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.UniqueField + 'title',
      });
    }

    try {
      return await this.prisma.userRole.update({
        where: { id: id },
        data: form,
      });
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'user role',
      });
    }
  }

  public async activateWithId(id: string) {
    try {
      return await this.prisma.userRole.update({
        where: { id: id },
        data: { status: BaseStatusesEnum.Active },
      });
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'user role',
      });
    }
  }

  public async archiveWithId(id: string) {
    try {
      return await this.prisma.userRole.update({
        where: { id: id },
        data: { status: BaseStatusesEnum.Archived },
      });
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'user role',
      });
    }
  }

  // ===== shared methods =====
  public async findRoleWithTitle(title: string) {
    const role = await this.prisma.userRole.findFirst({
      where: { title: title },
    });
    if (!role) {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'user role',
      });
    }

    return role;
  }
}
