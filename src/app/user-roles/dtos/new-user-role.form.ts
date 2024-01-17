import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
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
    minItems: 1,
    uniqueItems: true,
    enum: UserRolePermissionsEnum,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(UserRolePermissionsEnum, { each: true })
  permissions: UserRolePermissionsEnum[];

  @ApiProperty({
    description: 'User role type',
    enum: UserRoleTypesEnum,
  })
  @IsEnum(UserRoleTypesEnum)
  type: UserRoleTypesEnum;

  public static from(form: NewUserRoleForm) {
    const it = new NewUserRoleForm();
    it.title = form.title;
    it.type = form.type;
    it.permissions = form.permissions;

    return it;
  }

  public static async validate(form: NewUserRoleForm) {
    console.log(form);
    const errors = await validate(form);

    // return errors?.length
    //   ? errors.map((error) => Object.values(error.constraints).toString())
    //   : null;
    return errors?.length ? errors : null;
  }
}
