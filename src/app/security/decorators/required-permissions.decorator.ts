import { SetMetadata } from '@nestjs/common';
import { UserRolePermissionsEnum } from '@prisma/client';

export const RequiredPermissions = (
  ...permissions: UserRolePermissionsEnum[]
) => SetMetadata('required_permissions', permissions);
