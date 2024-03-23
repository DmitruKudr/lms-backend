import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsLowercase,
  IsOptional,
  IsString,
  Length,
  Matches,
  NotContains,
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
    description: 'Student username',
    minLength: 6,
    maxLength: 40,
    example: 'johndoejunior',
    required: false,
  })
  @IsString()
  @IsLowercase()
  @NotContains(' ', { message: 'username must not contain spaces' })
  @Length(6, 40, { message: 'name must be 6-40 characters long' })
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'Student email',
    format: 'email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Student password',
    minLength: 8,
    maxLength: 20,
    pattern: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$',
    example: 'qwerty12',
    required: false,
  })
  @IsString()
  @Length(8, 20, { message: 'password must be 8-20 characters long' })
  @Matches(/^(?=.*[A-Za-zА-ЯЁа-яё])(?=.*\d)[A-Za-zА-ЯЁа-яё\d]{8,}$/, {
    message:
      'password must consist only of letters and digits' +
      'password must contain at least one digit and letter',
  })
  @IsOptional()
  password?: string;

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
    it.username = form?.username;
    it.email = form?.email;
    it.password = form?.password;

    it.institution = form?.institution;
    it.birthDate = form?.birthDate;

    return it;
  }

  public static async validate(form: UpdateStudentForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
