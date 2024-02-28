import { ApiProperty } from '@nestjs/swagger';
import {
  UserRole,
  UserRolePermissionsEnum,
  UserRoleTypesEnum,
} from '@prisma/client';
import { StatusDto } from '../../../shared/dtos/status.dto';

export class UserRoleDto extends StatusDto {
  @ApiProperty({
    description: 'User role title (in lowercase)',
  })
  title!: string;

  @ApiProperty({
    description: 'User role permissions',
    isArray: true,
    minItems: 1,
    uniqueItems: true,
    enum: UserRolePermissionsEnum,
  })
  permissions!: UserRolePermissionsEnum[];

  @ApiProperty({
    description: 'User role type',
    enum: UserRoleTypesEnum,
  })
  type!: UserRoleTypesEnum;

  public static fromModel(model: UserRole) {
    const it = super.fromModel(model) as UserRoleDto;
    it.title = model.title;
    it.permissions = model.permissions;
    it.type = model.type;

    return it;
  }

  public static fromModels(models?: UserRole[]) {
    return !models?.map ? [] : models.map((model) => this.fromModel(model));
  }
}
