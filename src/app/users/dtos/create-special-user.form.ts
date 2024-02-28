import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsLowercase,
  IsOptional,
  IsString,
  Length,
  Matches,
  validate,
} from 'class-validator';
import { DefaultRolesEnum } from '../../security/enums/default-roles.enum';
import { hash } from 'argon2';
import { CreateUserForms } from '../types/create-user-forms.type';

export class CreateSpecialUserForm {
  @ApiProperty({
    description: 'User name',
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
  name: string;

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
    description: 'User role (not admin!)',
    example: 'self student',
  })
  @IsString()
  @IsLowercase()
  role!: string;

  public static from(form: CreateSpecialUserForm) {
    const it = new CreateSpecialUserForm();
    it.name = form.name || 'New ' + this.capitalizeFirstLetters(form.role);
    it.email = form.email;
    it.password = form.password;
    it.role = form.role;

    return it;
  }

  public static async beforeCreation(form: CreateUserForms) {
    const it = new CreateSpecialUserForm();
    it.name = form.name || 'New ' + this.capitalizeFirstLetters(form.role);
    it.email = form.email;
    it.password = await hash(form.password);

    return it;
  }

  public static async validate(form: CreateSpecialUserForm) {
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
