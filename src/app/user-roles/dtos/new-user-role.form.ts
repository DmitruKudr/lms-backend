import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString, validate } from 'class-validator';
import { UserRolePermissionsEnum, UserRoleTypesEnum } from '@prisma/client';

export class NewUserRoleForm {
  @ApiProperty({
    description: 'User role title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'User role permissions',
    isArray: true,
    enum: UserRolePermissionsEnum,
  })
  @IsArray({ context: UserRolePermissionsEnum })
  permissions: UserRolePermissionsEnum[];

  @ApiProperty({
    description: 'User role type',
    isArray: false,
    enum: UserRoleTypesEnum,
  })
  @IsEnum(UserRoleTypesEnum)
  type: UserRoleTypesEnum;

  public static async validate(form: NewUserRoleForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
