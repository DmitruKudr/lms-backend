import { BaseQueryDto } from '../../../shared/dtos/base-query.dto';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TeacherToStudentStatusesEnum } from '@prisma/client';
import { Transform } from 'class-transformer';
import { TypeParser } from '../../../shared/parsers/type-parser';

export class TeacherToStudentQueryDto extends BaseQueryDto {
  @Transform(({ value }) => TypeParser.toUuidV4(value))
  @IsUUID(4)
  @IsOptional()
  teacherId?: string;

  @Transform(({ value }) => TypeParser.toUuidV4(value))
  @IsUUID(4)
  @IsOptional()
  studentId?: string;

  @Transform(({ value }) =>
    TypeParser.toEnum(value, TeacherToStudentStatusesEnum),
  )
  @IsEnum(TeacherToStudentStatusesEnum)
  @IsOptional()
  confirmationStatus?: TeacherToStudentStatusesEnum;
}
