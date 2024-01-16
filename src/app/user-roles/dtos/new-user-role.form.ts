import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsString,
  MinLength,
  validate,
} from 'class-validator';
import { UserRolePermissionsEnum, UserRoleTypesEnum } from '@prisma/client';

export class NewUserRoleForm {
  @ApiProperty({
    description: 'User role title',
    minLength: 5,
  })
  @IsString()
  @MinLength(5)
  title: string;

  @ApiProperty({
    description: 'User role permissions',
    isArray: true,
    uniqueItems: true,
    enum: UserRolePermissionsEnum,
  })
  @IsArray()
  @ArrayUnique()
  @IsEnum(UserRolePermissionsEnum, { each: true })
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
