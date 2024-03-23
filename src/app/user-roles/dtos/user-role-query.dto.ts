import { BaseQueryDto } from '../../../shared/dtos/base-query.dto';
import { Transform } from 'class-transformer';
import { TypeParser } from '../../../shared/parsers/type-parser';
import { UserRoleTypesEnum } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UserRoleQueryDto extends BaseQueryDto {
  @Transform(({ value }) => TypeParser.toEnum(value, UserRoleTypesEnum))
  @IsEnum(UserRoleTypesEnum)
  @IsOptional()
  roleType?: UserRoleTypesEnum;
}
