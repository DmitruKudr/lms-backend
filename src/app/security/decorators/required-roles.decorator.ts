import { SetMetadata } from '@nestjs/common';
import { UserRoleTypesEnum } from '@prisma/client';

export const RequiredRoles = (...roles: UserRoleTypesEnum[]) =>
  SetMetadata('required_roles', roles);
