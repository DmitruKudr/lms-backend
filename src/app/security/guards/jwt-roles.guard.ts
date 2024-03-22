import { Reflector } from '@nestjs/core';
import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  CanActivate,
} from '@nestjs/common';
import { UserRolePermissionsEnum, UserRoleTypesEnum } from '@prisma/client';
import { PayloadAccessDto } from '../dtos/payload-access.dto';
import { isEmpty, includes, difference } from 'lodash';
import { ErrorCodesEnum } from '../../../shared/enums/error-codes.enum';
import { JwtPermissionsGuard } from './jwt-permissions.guard';

@Injectable()
export class JwtRolesGuard extends JwtPermissionsGuard implements CanActivate {
  protected roles: UserRoleTypesEnum[];
  protected adminPermissions: UserRolePermissionsEnum[];

  constructor(protected reflector: Reflector) {
    super(reflector);
  }

  canActivate(context: ExecutionContext) {
    this.roles =
      this.reflector.get<UserRoleTypesEnum[]>(
        'required_roles',
        context.getHandler(),
      ) || [];

    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  handleRequest(err: Error, payload: PayloadAccessDto) {
    // super.handleRequest(err, payload);

    if (includes(payload.permissions, UserRolePermissionsEnum.All)) {
      return payload;
    }

    if (isEmpty(this.roles)) {
      super.handleRequest(err, payload);
    }

    if (!includes(this.roles, payload.roleType)) {
      throw new ForbiddenException({
        statusCode: 403,
        message: ErrorCodesEnum.NotRequiredRole + this.roles.join(', '),
      });
    }

    return super.handleRequest(err, payload);
  }
}
