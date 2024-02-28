import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateDefaultUserForm } from './dtos/create-default-user.form';
import { SecurityService } from '../security/security.service';
import { CreateSpecialUserForm } from './dtos/create-special-user.form';
import { UserRoleTypesEnum } from '@prisma/client';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';

type CreateUserForms = CreateDefaultUserForm | CreateSpecialUserForm;
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private securityService: SecurityService,
  ) {}

  public async createUser(form: CreateUserForms) {
    await this.securityService.doesUserExist(form.email);
    const role = await this.securityService.findRoleWithTitle(form.role);

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
        username: await this.securityService.generateUsername(
          preparedForm.name,
        ),
        roleId: role.id,
      },
    });
    await this.prisma[role.type].create({ data: { id: newModel.id } });

    return newModel;
  }
}
