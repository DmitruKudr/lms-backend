import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserRoleForm } from './dtos/update-user-role.form';
import { PrismaService } from '../../prisma.service';
import { NewUserRoleForm } from './dtos/new-user-role.form';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { BaseStatusesEnum } from '@prisma/client';

@Injectable()
export class UserRolesService {
  constructor(private prisma: PrismaService) {}
  public async create(form: NewUserRoleForm) {
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

  public async findById(id: string) {
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

  public async updateById(id: string, form: UpdateUserRoleForm) {
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

  public async deleteById(id: string) {
    try {
      return await this.prisma.userRole.delete({
        where: { id: id },
      });
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'user role',
      });
    }
  }

  public async activateById(id: string) {
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

  public async archiveById(id: string) {
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
}
