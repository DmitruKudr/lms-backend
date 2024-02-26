import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches, validate } from 'class-validator';

export class SignInForm {
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

  public static from(form: SignInForm) {
    const it = new SignInForm();
    it.email = form.email;
    it.password = form.password;

    return it;
  }

  public static async validate(form: SignInForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
