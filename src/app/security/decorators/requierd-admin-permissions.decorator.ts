import { SetMetadata } from '@nestjs/common';
import { UserRolePermissionsEnum } from '@prisma/client';

export const RequiredAdminPermissions = (
  ...permissions: UserRolePermissionsEnum[]
) => SetMetadata('admin_permissions', permissions);
