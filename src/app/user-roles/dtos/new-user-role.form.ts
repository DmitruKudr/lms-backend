import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsLowercase,
  IsString,
  MinLength,
  validate,
} from 'class-validator';
import { UserRolePermissionsEnum, UserRoleTypesEnum } from '@prisma/client';

export class NewUserRoleForm {
  @ApiProperty({
    description: 'User role title (in lowercase)',
    minLength: 5,
  })
  @IsString()
  @MinLength(5)
  @IsLowercase()
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

  public static from(form: NewUserRoleForm) {
    const it = new NewUserRoleForm();
    it.title = form.title;
    it.permissions = form.permissions;
    it.type = form.type;

    return it;
  }

  public static async validate(form: NewUserRoleForm) {
    const errors = await validate(form);

    // return errors?.length
    //   ? errors.map((error) => Object.values(error.constraints).toString())
    //   : null;
    return errors?.length ? errors : null;
  }
}
