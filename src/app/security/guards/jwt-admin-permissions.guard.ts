import { Reflector } from '@nestjs/core';
import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  CanActivate,
} from '@nestjs/common';
import { UserRolePermissionsEnum, UserRoleTypesEnum } from '@prisma/client';
import { PayloadAccessDto } from '../dtos/payload-access.dto';
import { isEmpty, includes, difference } from 'lodash';
import { ErrorCodesEnum } from '../../../shared/enums/error-codes.enum';
import { JwtPermissionsGuard } from './jwt-permissions.guard';

@Injectable()
export class JwtAdminPermissionsGuard
  extends JwtPermissionsGuard
  implements CanActivate
{
  protected adminPermissions: UserRolePermissionsEnum[];

  constructor(protected reflector: Reflector) {
    super(reflector);
  }

  canActivate(context: ExecutionContext) {
    this.adminPermissions =
      this.reflector.get<UserRolePermissionsEnum[]>(
        'admin_permissions',
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

    if (isEmpty(this.adminPermissions)) {
      return super.handleRequest(err, payload);
    }

    if (payload.roleType === UserRoleTypesEnum.Admin) {
      const lackingPermissions = difference(
        this.adminPermissions,
        payload.permissions,
      );
      if (lackingPermissions.length) {
        throw new ForbiddenException({
          statusCode: 403,
          message:
            ErrorCodesEnum.NotEnoughAdminPermissions +
            lackingPermissions.join(', '),
        });
      }
    }

    return super.handleRequest(err, payload);
  }
}
