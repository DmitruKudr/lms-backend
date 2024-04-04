import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  Length,
  Matches,
  validate,
} from 'class-validator';

export class UpdateStudentForm {
  @ApiProperty({
    description: 'Student name',
    minLength: 6,
    maxLength: 40,
    pattern: '^((?:[А-ЯЁ][а-яё]+|[A-Z][a-z]+)(?:\\s|$)){2,3}$',
    example: 'John Doe Junior',
    required: false,
  })
  @IsString()
  @Length(6, 40, { message: 'name must be 6-40 characters long' })
  @Matches(/^((?:[А-ЯЁ][а-яё]+|[A-Z][a-z]+)(?:\s|$)){2,3}$/, {
    message:
      'name must be 2 or 3 words long, ' +
      'each word must start with a capital letter, ' +
      'name must not contain digits',
  })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Student birth date',
    example: '2024-03-21T16:21:32.206Z',
  })
  @IsDateString()
  @IsOptional()
  birthDate?: Date;

  @ApiProperty({
    description: 'Student institution title',
    minLength: 8,
    maxLength: 40,
    example: 'Stanford University',
  })
  @Length(8, 40, { message: 'institution title must be 8-40 characters long' })
  @IsString()
  @IsOptional()
  institution?: string;

  public static from(form: UpdateStudentForm) {
    const it = new UpdateStudentForm();
    it.name = form?.name;

    it.institution = form?.institution;
    it.birthDate = form?.birthDate;

    return it;
  }

  public static async validate(form: UpdateStudentForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
