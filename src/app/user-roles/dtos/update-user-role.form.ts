import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  validate,
} from 'class-validator';
import { UserRolePermissionsEnum } from '@prisma/client';

export class UpdateUserRoleForm {
  @ApiProperty({
    description: 'User role title',
    minLength: 5,
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  title?: string;

  @ApiProperty({
    description: 'User role permissions',
    isArray: true,
    minItems: 1,
    uniqueItems: true,
    enum: UserRolePermissionsEnum,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(UserRolePermissionsEnum, { each: true })
  permissions?: UserRolePermissionsEnum[];

  public static from(form: UpdateUserRoleForm) {
    const it = new UpdateUserRoleForm();
    it.title = form?.title;
    it.permissions = form?.permissions;

    return it;
  }

  public static async validate(form: UpdateUserRoleForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
