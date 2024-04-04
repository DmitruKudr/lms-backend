import { Transform } from 'class-transformer';
import { TypeParser } from '../parsers/type-parser';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class BaseQueryDto {
  @IsString()
  @IsOptional()
  queryLine?: string;

  @Transform(({ value }) => TypeParser.toPositiveNumber(value))
  @IsNumber()
  @IsOptional()
  pageNumber?: number;

  @Transform(({ value }) => TypeParser.toPositiveNumber(value))
  @IsNumber()
  @IsOptional()
  pageSize?: number;
}
