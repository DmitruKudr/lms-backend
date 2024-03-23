import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  validate,
} from 'class-validator';
import { DefaultRoleTitlesEnum } from '../../../shared/enums/default-role-titles.enum';

export class CreateDefaultStudentForm {
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
    description: 'Student email',
    format: 'email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Student password',
    minLength: 8,
    maxLength: 20,
    pattern: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$',
    example: 'qwerty12',
  })
  @IsString()
  @Length(8, 20, { message: 'password must be 8-20 characters long' })
  @Matches(/^(?=.*[A-Za-zА-ЯЁа-яё])(?=.*\d)[A-Za-zА-ЯЁа-яё\d]{8,}$/, {
    message:
      'password must consist only of letters and digits' +
      'password must contain at least one digit and letter',
  })
  password!: string;

  roleTitle: string;

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

  @ApiProperty({
    description: 'Student birth date',
    example: '2024-03-21T16:21:32.206Z',
  })
  @IsDateString()
  @IsOptional()
  birthDate?: Date;

  public static from(form: CreateDefaultStudentForm) {
    const it = new CreateDefaultStudentForm();
    it.name = form.name || 'New ' + this.capitalizeFirstLetters(form.roleTitle);
    it.email = form.email;
    it.password = form.password;
    it.roleTitle = DefaultRoleTitlesEnum.DefaultStudent;

    it.institution = form.institution;
    it.birthDate = form.birthDate;

    return it;
  }

  public static async validate(form: CreateDefaultStudentForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }

  private static capitalizeFirstLetters(str: string) {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
