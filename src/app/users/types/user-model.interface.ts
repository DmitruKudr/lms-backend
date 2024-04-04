import { UserRoleTypesEnum } from '@prisma/client';
import { IStatusModel } from '../../../shared/types/status-model.interface';

export interface IUserModel extends IStatusModel {
  name: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  recoveryLink: string;
  roleId: string;

  UserRole: {
    title: string;
    type: UserRoleTypesEnum;
  };
}
