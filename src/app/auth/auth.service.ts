import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignUpForm } from './dto/sign-up.form';
import { PrismaService } from '../../prisma.service';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
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

    const beforeCreation = SignUpForm.beforeCreation(form);
    const newModel = await this.prisma.user.create({
      data: {
        ...beforeCreation,
        username: beforeCreation.name,
        roleId: role.id,
      },
    });
    await this.prisma[role.type].create({ data: { id: newModel.id } });

    return newModel;
  }
}
