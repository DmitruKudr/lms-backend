import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpForm } from './dtos/sign-up.form';
import { PrismaService } from '../../prisma.service';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { SecurityService } from '../security/security.service';
import { SignInForm } from './dtos/sign-in.form';
import { verify } from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private securityService: SecurityService,
  ) {}

  public async signUp(form: SignUpForm) {
    await this.securityService.doesUserExist(form.email);
    const role = await this.securityService.findRoleWithTitle(form.role);

    const preparedForm = await SignUpForm.beforeCreation(form);
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

    return await this.securityService.generateTokens(newModel, role);
  }

  public async signIn(form: SignInForm) {
    const user = await this.prisma.user.findUnique({
      where: { email: form.email },
    });
    if (!user) {
      throw new BadRequestException({
        statusCode: 404,
        message: `${ErrorCodesEnum.NotFound}user with email ${form.email}`,
      });
    }

    const role = await this.prisma.userRole.findUnique({
      where: { id: user.roleId },
    });
    if (!role) {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'user role',
      });
    }

    if (!(await verify(user.password, form.password))) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: ErrorCodesEnum.InvalidPassword,
      });
    }

    return await this.securityService.generateTokens(user, role);
  }

  public async getAccessToken(refreshToken: string) {
    return await this.securityService.generateAccessToken(refreshToken);
  }
}
