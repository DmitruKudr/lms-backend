import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID, validate } from 'class-validator';

export class TeacherToStudentForm {
  @ApiProperty({
    description: 'Teacher id to connect',
    example: '55166992-03b0-40ce-8128-7454b2907f5c',
  })
  @IsUUID(4)
  teacherId: string;

  @ApiProperty({
    description: 'Student id to connect',
    example: '55166992-03b0-40ce-8128-7454b2907f5c',
  })
  @IsUUID(4)
  studentId: string;

  @ApiProperty({
    description: 'Is request from teacher',
  })
  @IsBoolean()
  @IsOptional()
  fromTeacher?: boolean;

  public static from(form: TeacherToStudentForm) {
    const it = new TeacherToStudentForm();
    it.teacherId = form.teacherId;
    it.studentId = form.studentId;
    it.fromTeacher = form.fromTeacher;

    return it;
  }

  public static async validate(form: TeacherToStudentForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
