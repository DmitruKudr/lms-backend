import { BaseQueryDto } from '../../../shared/dtos/base-query.dto';
import { Transform } from 'class-transformer';
import { TypeParser } from '../../../shared/parsers/type-parser';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsLowercase,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TestAccessesEnum, TestStatusesEnum } from '@prisma/client';

export class TestQueryDto extends BaseQueryDto {
  @IsString()
  @IsOptional()
  language?: string;

  @Transform(({ value }) => TypeParser.toPositiveNumber(value))
  @IsNumber()
  @IsOptional()
  maxDuration?: number;

  @Transform(({ value }) => TypeParser.toEnum(value, TestAccessesEnum))
  @IsEnum(TestAccessesEnum)
  @IsOptional()
  access?: TestAccessesEnum;

  @Transform(({ value }) => TypeParser.toEnum(value, TestStatusesEnum))
  @IsEnum(TestStatusesEnum)
  @IsOptional()
  testStatus?: TestStatusesEnum;

  @Transform(({ value }) => TypeParser.toUniqueLowercaseArray(value))
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsLowercase({ each: true })
  @ArrayUnique()
  @IsOptional()
  subjects?: string[];

  // @Transform(({ value }) => TypeParser.toUuidV4(value))
  // @IsUUID(4)
  // @IsOptional()
  // teacherId?: string;

  @Transform(({ value }) => TypeParser.toUniqueUuidV4Array(value))
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(4, { each: true })
  @ArrayUnique()
  @IsOptional()
  teacherIds?: string[];

  @Transform(({ value }) => TypeParser.toBoolean(value))
  @IsBoolean()
  @IsOptional()
  onlyMyTeachers?: boolean;
}
