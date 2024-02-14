import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignUpForm } from './dtos/sign-up.form';
import { PrismaService } from '../../prisma.service';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { SecurityService } from '../security/security.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private securityService: SecurityService,
  ) {}
  public async signUp(form: SignUpForm) {
    const doesUserExist = await this.prisma.user.findFirst({
      where: { email: form.email },
    });
    if (doesUserExist) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.UserExists,
      });
    }

    const role = await this.prisma.userRole.findFirst({
      where: { title: form.role },
    });
    if (!role) {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'user role',
      });
    }

    const preparedForm = await SignUpForm.beforeCreation(form);
    const newModel = await this.prisma.user.create({
      data: {
        ...preparedForm,
        username: preparedForm.name + '123',
        roleId: role.id,
      },
    });
    await this.prisma[role.type].create({ data: { id: newModel.id } });

    return await this.securityService.generateTokens(newModel, role);
  }
}
