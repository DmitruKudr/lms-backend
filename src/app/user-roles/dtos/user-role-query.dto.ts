import { BaseQueryDto } from '../../../shared/dtos/base-query.dto';
import { Transform } from 'class-transformer';
import { Parser } from '../../../shared/parsers/parser';
import { UserRoleTypesEnum } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UserRoleQueryDto extends BaseQueryDto {
  @Transform(({ value }) => Parser.toEnum(value, UserRoleTypesEnum))
  @IsEnum(UserRoleTypesEnum)
  @IsOptional()
  roleType?: UserRoleTypesEnum;
}
