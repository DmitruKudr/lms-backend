import { ApiProperty } from '@nestjs/swagger';
import { TeacherToStudent, TeacherToStudentStatusesEnum } from '@prisma/client';
import { BaseModelDto } from '../../../shared/dtos/base-model.dto';

export class TeacherToStudentDto extends BaseModelDto {
  @ApiProperty({
    description: 'Teacher id to connect',
    example: '55166992-03b0-40ce-8128-7454b2907f5c',
  })
  teacherId: string;

  @ApiProperty({
    description: 'Student id to connect',
    example: '55166992-03b0-40ce-8128-7454b2907f5c',
  })
  studentId: string;

  @ApiProperty({
    description: 'Is request from teacher',
    type: TeacherToStudentStatusesEnum,
  })
  confirmationStatus: TeacherToStudentStatusesEnum;

  public static fromModel(model: TeacherToStudent) {
    const it = super.fromModel(model) as TeacherToStudentDto;
    it.teacherId = model.teacherId;
    it.studentId = model.studentId;
    it.confirmationStatus = model.confirmationStatus;

    return it;
  }
}
