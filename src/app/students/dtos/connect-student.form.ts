import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsUUID,
  validate,
} from 'class-validator';

export class ConnectStudentForm {
  @ApiProperty({
    description: 'Teachers id list to connect',
    example: [
      '55166992-03b0-40ce-8128-7454b2907f5c',
      '55166992-03b0-40ce-8128-7454b2907f5d',
    ],
    isArray: true,
    required: false,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsOptional()
  @IsUUID(4, { each: true })
  teachers?: string[];

  @ApiProperty({
    description: 'Parents id list to connect',
    example: [
      '55166992-03b0-40ce-8128-7454b2907f5c',
      '55166992-03b0-40ce-8128-7454b2907f5d',
    ],
    isArray: true,
    required: false,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsOptional()
  @IsUUID(4, { each: true })
  parents?: string[];

  public static from(form: ConnectStudentForm) {
    const it = new ConnectStudentForm();
    it.teachers = form.teachers;
    it.parents = form.parents;

    return it;
  }

  public static async validate(form: ConnectStudentForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
