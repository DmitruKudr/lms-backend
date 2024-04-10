import { ApiProperty } from '@nestjs/swagger';
import {
  IsLowercase,
  IsOptional,
  IsString,
  Length,
  NotContains,
  validate,
} from 'class-validator';

export class ChangeUsernameForm {
  @ApiProperty({
    description: 'User username',
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

  public static from(form: ChangeUsernameForm) {
    const it = new ChangeUsernameForm();
    it.username = form.username;

    return it;
  }

  public static async validate(form: ChangeUsernameForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
