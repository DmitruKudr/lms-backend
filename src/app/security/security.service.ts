import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtTokensDto } from './dtos/jwt-tokens.dto';
import { User, UserRole } from '@prisma/client';
import { UserSessionDto } from './dtos/user-session.dto';
import { JwtService } from '@nestjs/jwt';
import * as process from 'process';

@Injectable()
export class SecurityService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  public async generateTokens(userModel: User, roleModel: UserRole) {
    const payload = UserSessionDto.fromModel(userModel, roleModel);
    const accessToken = await this.jwtService.signAsync(
      { ...payload },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { userId: userModel.id },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken } as JwtTokensDto;
  }

  public async generateAccessToken(refreshToken: string) {
    return refreshToken;
  }
}
