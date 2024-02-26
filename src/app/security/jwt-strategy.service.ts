import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecurityService } from './security.service';
import { PayloadAccessDto } from './dtos/payload-access.dto';
import { PayloadRefreshDto } from './dtos/payload-refresh.dto';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { BaseStatusesEnum } from '@prisma/client';

type PayloadType = PayloadAccessDto | PayloadRefreshDto;

@Injectable()
export class JwtStrategyService extends PassportStrategy(
  Strategy,
  'jwt-strategy',
) {
  readonly name = 'jwt-strategy';
  constructor(
    private configService: ConfigService,
    private securityService: SecurityService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: PayloadType) {
    const user = await this.securityService.getUserById(payload.id);

    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: ErrorCodesEnum.UserNotExists,
      });
    }

    if (user.status !== BaseStatusesEnum.Active) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: ErrorCodesEnum.UserNotActive,
      });
    }

    return payload;
  }

  // public async validate(payload: PayloadType) {
  //   try {
  //     payload instanceof PayloadAccessDto
  //       ? await this.validateAccess(payload)
  //       : await this.validateRefresh(payload);
  //   } catch {
  //     throw new UnauthorizedException({
  //       statusCode: 401,
  //       message: `${ErrorCodesEnum.TokenExpired} or ${ErrorCodesEnum.WrongPayload}`,
  //     });
  //   }
  // }
  //
  // private async validateAccess(payload: PayloadAccessDto) {
  //   const user = await this.securityService.getUserById(payload.id);
  //
  //   if (!user) {
  //     throw new UnauthorizedException({
  //       statusCode: 401,
  //       message: ErrorCodesEnum.UserNotExists,
  //     });
  //   }
  //
  //   if (user.status !== BaseStatusesEnum.Active) {
  //     throw new UnauthorizedException({
  //       statusCode: 401,
  //       message: ErrorCodesEnum.UserNotActive,
  //     });
  //   }
  //
  //   return user;
  // }
  //
  // private async validateRefresh(payload: PayloadRefreshDto) {
  //   return 'aboba';
  // }
}
