import { UserRole, UserRolePermissionsEnum } from '@prisma/client';
import { IUserWithRole } from '../../users/types/user-with-role.interface';

export class PayloadAccessDto {
  id: string;
  username: string;
  email: string;
  roleId: string;
  roleType: string;
  permissions: UserRolePermissionsEnum[];
  public static fromModel(userModel: IUserWithRole, roleModel: UserRole) {
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
