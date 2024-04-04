import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtTokensDto } from './dtos/jwt-tokens.dto';
import { PayloadAccessDto } from './dtos/payload-access.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma.service';
import { PayloadRefreshDto } from './dtos/payload-refresh.dto';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { IUserModel } from '../users/types/user-model.interface';

@Injectable()
export class SecurityService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  public async generateTokens(userModel: IUserModel) {
    const roleModel = await this.getRoleWithId(userModel.roleId);
    const payload = PayloadAccessDto.fromModel(userModel, roleModel);
    const accessToken = await this.jwtService.signAsync(
      { ...payload },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '1h',
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { id: userModel.id },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken } as JwtTokensDto;
  }

  public async generateAccessToken(refreshToken: string) {
    const refreshPayload = (await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get('JWT_SECRET'),
    })) as PayloadRefreshDto;

    if (!refreshPayload) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: ErrorCodesEnum.InvalidRefresh,
      });
    }

    const user = await this.getUserWithId(refreshPayload.id);
    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: ErrorCodesEnum.UserDoesNotExist,
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

    const accessPayload = PayloadAccessDto.fromModel(user, role);
    return await this.jwtService.signAsync(
      { ...accessPayload },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '1h',
      },
    );
  }
  public async getUserWithId(id: string) {
    return (await this.prisma.user.findUnique({
      where: { id: id },
      include: { UserRole: { select: { title: true, type: true } } },
    })) as IUserModel;
  }

  public async getRoleWithId(id: string) {
    return this.prisma.userRole.findUnique({ where: { id: id } });
  }
}
