import { Transform } from 'class-transformer';
import { Parser } from '../parsers/parser';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class BaseQueryDto {
  @IsString()
  @IsOptional()
  queryLine?: string;

  @Transform(({ value }) => Parser.toPositiveNumber(value))
  @IsNumber()
  @IsOptional()
  pageNumber?: number;

  @Transform(({ value }) => Parser.toPositiveNumber(value))
  @IsNumber()
  @IsOptional()
  pageSize?: number;
}
