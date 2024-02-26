import { Reflector } from '@nestjs/core';
import {
  Injectable,
  ExecutionContext,
  CanActivate,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRolePermissionsEnum } from '@prisma/client';
import { PayloadAccessDto } from '../dtos/payload-access.dto';
import { difference, isEmpty, includes } from 'lodash';
import { ErrorCodesEnum } from '../../../shared/enums/error-codes.enum';

@Injectable()
export class JwtPermissionsGuard
  extends AuthGuard('jwt-strategy')
  implements CanActivate
{
  protected permissions: UserRolePermissionsEnum[];

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    this.permissions =
      this.reflector.get<UserRolePermissionsEnum[]>(
        'required_permissions',
        context.getHandler(),
      ) || [];
    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  handleRequest(err: Error, payload: PayloadAccessDto) {
    if (err || !payload) {
      throw (
        err ||
        new UnauthorizedException({
          statusCode: 401,
          message: ErrorCodesEnum.NotAuthorized,
        })
      );
    }

    if (isEmpty(this.permissions)) {
      return payload;
    }

    if (includes(payload.permissions, UserRolePermissionsEnum.All)) {
      return payload;
    }

    const lackingPermissions = difference(
      this.permissions,
      payload.permissions,
    );
    if (lackingPermissions.length) {
      throw new ForbiddenException({
        statusCode: 403,
        message:
          ErrorCodesEnum.NotEnoughPermissions + lackingPermissions.join(', '),
      });
    }

    return payload;
  }
}
