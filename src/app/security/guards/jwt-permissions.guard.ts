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
import { difference, isEmpty, includes, intersection } from 'lodash';
import { ErrorCodesEnum } from '../../../shared/enums/error-codes.enum';

@Injectable()
export class JwtPermissionsGuard
  extends AuthGuard('jwt-strategy')
  implements CanActivate
{
  protected permissions: UserRolePermissionsEnum[];
  protected anyPermissionsMatch: boolean;

  constructor(protected reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    this.permissions =
      this.reflector.get<UserRolePermissionsEnum[]>(
        'required_permissions',
        context.getHandler(),
      ) || [];
    this.anyPermissionsMatch =
      this.reflector.get<boolean>(
        'any_required_permissions_match',
        context.getHandler(),
      ) || false;

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

    if (this.anyPermissionsMatch) {
      if (intersection(this.permissions, payload.permissions).length === 0) {
        throw new ForbiddenException({
          statusCode: 403,
          message: `${
            ErrorCodesEnum.NotEnoughPermissions
          } ${this.permissions.join(', ')} (match at least one permission)`,
        });
      }

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
