import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsString,
  MinLength,
} from 'class-validator';
import {
  UserRole,
  UserRolePermissionsEnum,
  UserRoleTypesEnum,
} from '@prisma/client';
import { StatusDto } from '../../../shared/dtos/status.dto';

export class UserRoleDto extends StatusDto {
  @ApiProperty({
    description: 'User role title',
    minLength: 5,
  })
  @IsString()
  @MinLength(5)
  title!: string;

  @ApiProperty({
    description: 'User role permissions',
    isArray: true,
    minItems: 1,
    uniqueItems: true,
    enum: UserRolePermissionsEnum,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(UserRolePermissionsEnum, { each: true })
  permissions!: UserRolePermissionsEnum[];

  @ApiProperty({
    description: 'User role type',
    enum: UserRoleTypesEnum,
  })
  @IsEnum(UserRoleTypesEnum)
  type!: UserRoleTypesEnum;

  public static fromModel(model: UserRole) {
    const it = super.fromModel(model) as UserRoleDto;
    it.title = model.title;
    it.permissions = model.permissions;
    it.type = model.type;

    return it;
  }

  public static fromModels(models?: UserRole[]) {
    return !models?.length ? [] : models.map((model) => this.fromModel(model));
  }
}
