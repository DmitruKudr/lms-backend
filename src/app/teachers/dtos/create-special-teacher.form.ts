import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsLowercase,
  IsOptional,
  IsString,
  Length,
  Matches,
  validate,
} from 'class-validator';

export class CreateSpecialTeacherForm {
  @ApiProperty({
    description: 'Teacher name',
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
    description: 'Teacher email',
    format: 'email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Teacher password',
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

  @ApiProperty({
    description: 'Teacher role title (role type must be Teacher!)',
    example: 'institution teacher',
  })
  @IsString()
  @IsLowercase()
  roleTitle!: string;

  @ApiProperty({
    description: 'Teacher institution title',
    minLength: 8,
    maxLength: 40,
    example: 'Stanford University',
  })
  @Length(8, 40, { message: 'institution title must be 8-40 characters long' })
  @IsString()
  @IsOptional()
  institution?: string;

  @ApiProperty({
    description: 'Teacher post (position)',
    minLength: 6,
    maxLength: 40,
    example: 'Primary school teacher',
  })
  @Length(6, 40, { message: 'post title must be 6-40 characters long' })
  @IsString()
  @IsOptional()
  post?: string;

  @ApiProperty({
    description: 'Teacher subjects to teach',
    isArray: true,
    minItems: 1,
    uniqueItems: true,
    example: ['math', 'physics'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsLowercase({ each: true })
  @ArrayUnique()
  @IsOptional()
  subjects?: string[];

  public static from(form: CreateSpecialTeacherForm) {
    const it = new CreateSpecialTeacherForm();
    it.name = form.name || 'New ' + this.capitalizeFirstLetters(form.roleTitle);
    it.email = form.email;
    it.password = form.password;
    it.roleTitle = form.roleTitle;

    it.institution = form.institution;
    it.post = form.post;
    it.subjects = form.subjects;

    return it;
  }

  public static async validate(form: CreateSpecialTeacherForm) {
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
