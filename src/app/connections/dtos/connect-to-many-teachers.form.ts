import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsUUID,
  validate,
} from 'class-validator';

export class ConnectToManyTeachersForm {
  @ApiProperty({
    description: 'Teacher id list to connect',
    example: [
      '55166992-03b0-40ce-8128-7454b2907f5c',
      '55166992-03b0-40ce-8128-7454b2907f5d',
    ],
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID(4, { each: true })
  teacherIds: string[];

  public static from(form: ConnectToManyTeachersForm) {
    const it = new ConnectToManyTeachersForm();
    it.teacherIds = form.teacherIds;

    return it;
  }

  public static async validate(form: ConnectToManyTeachersForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
