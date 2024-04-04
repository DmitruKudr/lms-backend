import { SetMetadata } from '@nestjs/common';
import { UserRolePermissionsEnum } from '@prisma/client';

export const AnyRequiredPermissionsMatch = () =>
  SetMetadata('any_required_permissions_match', true);
