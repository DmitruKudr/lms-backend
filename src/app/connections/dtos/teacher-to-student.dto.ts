import { ApiProperty } from '@nestjs/swagger';
import { TeacherToStudent, TeacherToStudentStatusesEnum } from '@prisma/client';
import { BaseModelDto } from '../../../shared/dtos/base-model.dto';
import { ITeacherToStudentModel } from '../types/teacher-to-student-model.interface';
import { StudentDto } from '../../students/dtos/student.dto';
import { TeacherDto } from '../../teachers/dtos/teacher.dto';

export class TeacherToStudentDto extends BaseModelDto {
  @ApiProperty({
    description: 'Teacher id',
    example: '55166992-03b0-40ce-8128-7454b2907f5c',
  })
  teacherId: string;

  @ApiProperty({
    description: 'Student id',
    example: '55166992-03b0-40ce-8128-7454b2907f5c',
  })
  studentId: string;

  @ApiProperty({
    description: 'Confirmation status',
    enum: TeacherToStudentStatusesEnum,
  })
  confirmationStatus: TeacherToStudentStatusesEnum;

  @ApiProperty({
    description: 'Teacher data',
    type: TeacherDto,
  })
  teacher?: TeacherDto;

  @ApiProperty({
    description: 'Student data',
    type: StudentDto,
  })
  student?: StudentDto;

  public static fromModel(model: ITeacherToStudentModel) {
    const it = super.fromModel(model) as TeacherToStudentDto;
    it.teacherId = model.teacherId;
    it.studentId = model.studentId;
    it.confirmationStatus = model.confirmationStatus;

    if (model.Teacher && Object.keys(model.Teacher).length) {
      it.teacher = TeacherDto.fromModel(model.Teacher.User);
    }
    if (model.Student && Object.keys(model.Student).length) {
      it.student = StudentDto.fromModel(model.Student.User);
    }

    return it;
  }

  public static fromModels(models: TeacherToStudent[]) {
    return !models?.map ? [] : models.map((model) => this.fromModel(model));
  }
}
