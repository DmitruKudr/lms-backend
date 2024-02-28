import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtTokensDto } from './dtos/jwt-tokens.dto';
import { User, UserRole } from '@prisma/client';
import { PayloadAccessDto } from './dtos/payload-access.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma.service';
import { PayloadRefreshDto } from './dtos/payload-refresh.dto';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';

@Injectable()
export class SecurityService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  public async generateTokens(userModel: User, roleModel: UserRole) {
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

    const user = await this.prisma.user.findUnique({
      where: { id: refreshPayload.id },
    });
    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: ErrorCodesEnum.UserNotExists,
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

  public async getUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id: id } });
  }
}
