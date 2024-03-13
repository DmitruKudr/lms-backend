import { Transform } from 'class-transformer';
import { Parser } from '../parsers/parser';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class BaseQueryDto {
  @IsString()
  @IsOptional()
  queryLine?: string;

  @Transform(({ value }) => Parser.toNumber(value))
  @IsNumber()
  @IsOptional()
  pageNumber?: number;

  @Transform(({ value }) => Parser.toNumber(value))
  @IsNumber()
  @IsOptional()
  pageSize?: number;
}
