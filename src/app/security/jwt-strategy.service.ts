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
    const user = await this.securityService.getUserWithId(payload.id);

    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: ErrorCodesEnum.UserDoesNotExist,
      });
    }

    if (user.status !== BaseStatusesEnum.Active) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: ErrorCodesEnum.UserIsNotActive,
      });
    }

    return payload;
  }
}
