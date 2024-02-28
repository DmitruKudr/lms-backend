import {
  BaseStatusesEnum,
  User,
  UserRole,
  UserRoleTypesEnum,
} from '@prisma/client';

export interface UserWithRole {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: BaseStatusesEnum;

  name: string;
  username: string;
  email: string;
  roleId: string;

  UserRole: {
    title: string;
    type: UserRoleTypesEnum;
  };
}
