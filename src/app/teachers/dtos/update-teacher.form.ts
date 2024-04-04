import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsLowercase,
  IsOptional,
  IsString,
  Length,
  Matches,
  validate,
} from 'class-validator';

export class UpdateTeacherForm {
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

  public static from(form: UpdateTeacherForm) {
    const it = new UpdateTeacherForm();
    it.name = form?.name;

    it.institution = form?.institution;
    it.post = form?.post;
    it.subjects = form?.subjects;

    return it;
  }

  public static async validate(form: UpdateTeacherForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
