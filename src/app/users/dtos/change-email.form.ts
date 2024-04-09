import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, validate } from 'class-validator';

export class ChangeEmailForm {
  @ApiProperty({
    description: 'User email',
    format: 'email',
  })
  @IsEmail()
  email!: string;

  public static from(form: ChangeEmailForm) {
    const it = new ChangeEmailForm();
    it.email = form.email;

    return it;
  }

  public static async validate(form: ChangeEmailForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
