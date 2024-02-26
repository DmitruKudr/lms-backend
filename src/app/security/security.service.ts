import { Injectable } from '@nestjs/common';
import { JwtTokensDto } from './dtos/jwt-tokens.dto';
import { User, UserRole } from '@prisma/client';
import { PayloadAccessDto } from './dtos/payload-access.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma.service';

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
    return refreshToken;
  }

  public async getUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id: id } });
  }
}
