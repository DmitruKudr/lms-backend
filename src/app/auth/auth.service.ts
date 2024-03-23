import {
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
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private securityService: SecurityService,
    private usersService: UsersService,
  ) {}

  public async signUp(form: SignUpForm) {
    const newModel = await this.usersService.create(form);

    return await this.securityService.generateTokens(newModel);
  }

  public async signIn(form: SignInForm) {
    const user = await this.usersService.findUserWithEmail(form.email);

    if (!(await verify(user.password, form.password))) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: ErrorCodesEnum.InvalidPassword,
      });
    }

    return await this.securityService.generateTokens(user);
  }

  public async getAccessToken(refreshToken: string) {
    return await this.securityService.generateAccessToken(refreshToken);
  }
}
