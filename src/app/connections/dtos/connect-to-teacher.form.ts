import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, validate } from 'class-validator';

export class ConnectToTeacherForm {
  @ApiProperty({
    description: 'Teacher id to connect',
    example: '55166992-03b0-40ce-8128-7454b2907f5c',
  })
  @IsUUID(4)
  teacherId: string;

  public static from(form: ConnectToTeacherForm) {
    const it = new ConnectToTeacherForm();
    it.teacherId = form.teacherId;

    return it;
  }

  public static async validate(form: ConnectToTeacherForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
