import { BaseQueryDto } from '../../../shared/dtos/base-query.dto';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsLowercase,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TypeParser } from '../../../shared/parsers/type-parser';

export class TeacherQueryDto extends BaseQueryDto {
  @Transform(({ value }) => TypeParser.toUniqueLowercaseArray(value))
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsLowercase({ each: true })
  @ArrayUnique()
  @IsOptional()
  subjects?: string[];
}
