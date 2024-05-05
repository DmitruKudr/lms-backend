import {
  UserRole,
  UserRolePermissionsEnum,
  UserRoleTypesEnum,
} from '@prisma/client';
import { IUserModel } from '../../users/types/user-model.interface';

export class PayloadAccessDto {
  id: string;
  username: string;
  email: string;
  roleId: string;
  roleType: UserRoleTypesEnum;
  permissions: UserRolePermissionsEnum[];

  public static fromModel(userModel: IUserModel, roleModel: UserRole) {
    const it = new PayloadAccessDto();
    it.id = userModel.id;
    it.username = userModel.username;
    it.email = userModel.email;
    it.roleId = userModel.roleId;
    it.roleType = roleModel.type;
    it.permissions = roleModel.permissions;

    return it;
  }
}
