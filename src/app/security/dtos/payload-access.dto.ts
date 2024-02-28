import { User, UserRole, UserRolePermissionsEnum } from '@prisma/client';

export class PayloadAccessDto {
  id: string;
  username: string;
  email: string;
  roleId: string;
  roleType: string;
  permissions: UserRolePermissionsEnum[];
  public static fromModel(userModel: User, roleModel: UserRole) {
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
