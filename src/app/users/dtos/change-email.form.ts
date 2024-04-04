import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, validate } from 'class-validator';

export class ChangeEmailForm {
  @ApiProperty({
    description: 'New user email',
    format: 'email',
  })
  @IsEmail()
  newEmail!: string;

  public static from(form: ChangeEmailForm) {
    const it = new ChangeEmailForm();
    it.newEmail = form.newEmail;

    return it;
  }

  public static async validate(form: ChangeEmailForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
