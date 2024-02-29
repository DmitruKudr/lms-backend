import { UserRoleTypesEnum } from '@prisma/client';
import { StatusDto } from '../../../shared/dtos/status.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UserWithRole } from '../types/user-with-role.interface';

export class UserWithRoleDto extends StatusDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe Junior',
  })
  name!: string;

  @ApiProperty({
    description: 'User username',
    example: 'johndoejunior123',
  })
  username!: string;

  @ApiProperty({
    description: 'User email',
    format: 'email',
  })
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'qwerty12',
    required: false,
  })
  password?: string;

  @ApiProperty({
    description: 'User role id',
    format: 'uuid',
  })
  roleId!: string;

  @ApiProperty({
    description: 'User role title',
    example: 'default parent',
  })
  roleTitle!: string;

  @ApiProperty({
    description: 'User role type',
    enum: UserRoleTypesEnum,
  })
  roleType!: UserRoleTypesEnum;

  public static fromModel(userAndRole: UserWithRole, password?: string) {
    const it = super.fromModel(userAndRole) as UserWithRoleDto;
    it.name = userAndRole.name;
    it.username = userAndRole.username;
    it.email = userAndRole.email;
    password && (it.password = password);
    it.roleId = userAndRole.roleId;

    it.roleTitle = userAndRole.UserRole.title;
    it.roleType = userAndRole.UserRole.type;

    return it;
  }
  public static fromModels(userWithRoleList: UserWithRole[]) {
    return !userWithRoleList?.map
      ? []
      : userWithRoleList.map((userWithRole) => this.fromModel(userWithRole));
  }
}
