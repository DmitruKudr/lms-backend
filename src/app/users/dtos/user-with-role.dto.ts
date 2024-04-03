import { UserRoleTypesEnum } from '@prisma/client';
import { StatusModelDto } from '../../../shared/dtos/status-model.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IUserWithRole } from '../types/user-with-role.interface';

export class UserWithRoleDto extends StatusModelDto {
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
    description: 'User avatar',
    example: 'avatar.png',
  })
  avatar!: string;

  @ApiProperty({
    description: 'User role title',
    example: 'default student',
  })
  roleTitle?: string;

  @ApiProperty({
    description: 'User role type',
    enum: UserRoleTypesEnum,
  })
  roleType?: UserRoleTypesEnum;

  public static fromModel(model: IUserWithRole, password?: string) {
    const it = super.fromModel(model) as UserWithRoleDto;
    it.name = model.name;
    it.username = model.username;
    it.email = model.email;
    password && (it.password = password);
    it.avatar = model.avatar;
    it.roleId = model.roleId;

    it.roleTitle = model.UserRole.title;
    it.roleType = model.UserRole.type;

    return it;
  }
  public static fromModels(models: IUserWithRole[]) {
    return !models?.map ? [] : models.map((model) => this.fromModel(model));
  }
}
