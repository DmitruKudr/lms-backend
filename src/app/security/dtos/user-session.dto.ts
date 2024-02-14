import { User, UserRole, UserRolePermissionsEnum } from '@prisma/client';

export class UserSessionDto {
  id: string;
  email: string;
  roleId: string;
  roleType: string;
  permissions: UserRolePermissionsEnum[];
  public static fromModel(userModel: User, roleModel: UserRole) {
    const it = new UserSessionDto();
    it.id = userModel.id;
    it.email = userModel.email;
    it.roleId = userModel.roleId;
    it.roleType = roleModel.type;
    it.permissions = roleModel.permissions;

    return it;
  }
}
