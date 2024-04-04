import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches, validate } from 'class-validator';

export class ChangePasswordForm {
  @ApiProperty({
    description: 'New user password',
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
  newPassword!: string;

  @ApiProperty({
    description: 'Old user password',
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
  oldPassword!: string;

  public static from(form: ChangePasswordForm) {
    const it = new ChangePasswordForm();
    it.newPassword = form.newPassword;
    it.oldPassword = form.oldPassword;

    return it;
  }

  public static async validate(form: ChangePasswordForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
