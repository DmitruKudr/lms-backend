import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsString,
  Length,
  Matches,
  validate,
} from 'class-validator';
import { DefaultRolesEnum } from '../../user-roles/enums/default-roles.enum';

export class SignUpForm {
  @ApiProperty({
    description: 'User name',
    minLength: 6,
    maxLength: 40,
    pattern: '^((?:[А-ЯЁ][а-яё]+|[A-Z][a-z]+)(?:\\s|$)){2,3}$',
    example: 'John Doe Junior',
  })
  @IsString()
  @Length(6, 40, { message: 'name must be 6-40 characters long' })
  @Matches(/^((?:[А-ЯЁ][а-яё]+|[A-Z][a-z]+)(?:\s|$)){2,3}$/, {
    message:
      'name must be 2 or 3 words long, ' +
      'each word must start with a capital letter, ' +
      'name must not contain digits',
  })
  name!: string;

  @ApiProperty({
    description: 'User email',
    format: 'email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User password',
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
    description: 'User default role',
    enum: DefaultRolesEnum,
  })
  @IsEnum(DefaultRolesEnum)
  role!: DefaultRolesEnum;

  public static from(form: SignUpForm) {
    const it = new SignUpForm();
    it.name = form.name;
    it.email = form.email;
    it.password = form.password;
    it.role = form.role;

    return it;
  }

  public static beforeCreation(form: SignUpForm) {
    const it = new SignUpForm();
    it.name = form.name;
    it.email = form.email;
    it.password = form.password;

    return it;
  }

  public static async validate(form: SignUpForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
