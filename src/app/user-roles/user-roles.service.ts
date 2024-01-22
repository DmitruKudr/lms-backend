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
        message: ErrorCodesEnum.FieldUnique + 'title',
      });
    }
    const newModel = await this.prisma.userRole.create({ data: form });

    return newModel;
  }

  public async findAll() {
    const models = await this.prisma.userRole.findMany();

    return models;
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
    const isTitleUnique = await this.prisma.userRole.findFirst({
      where: { title: form.title },
    });
    if (isTitleUnique) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.FieldUnique + 'title',
      });
    }

    try {
      const model = await this.prisma.userRole.update({
        where: { id: id },
        data: form,
      });

      return model;
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'user role',
      });
    }
  }

  public async deleteById(id: string) {
    try {
      const model = await this.prisma.userRole.delete({
        where: { id: id },
      });

      return model;
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'user role',
      });
    }
  }

  public async activateById(id: string) {
    try {
      const model = await this.prisma.userRole.update({
        where: { id: id },
        data: { status: BaseStatusesEnum.Active },
      });

      return model;
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'user role',
      });
    }
  }

  public async archiveById(id: string) {
    try {
      const model = await this.prisma.userRole.update({
        where: { id: id },
        data: { status: BaseStatusesEnum.Archived },
      });

      return model;
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'user role',
      });
    }
  }
}
