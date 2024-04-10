import { ApiProperty } from '@nestjs/swagger';
import { IsLowercase, IsString, validate } from 'class-validator';

export class CreateSubjectForm {
  @ApiProperty({
    description: 'Subject title (in lowercase!)',
    example: 'math',
  })
  @IsString()
  @IsLowercase()
  title!: string;

  public static from(form: CreateSubjectForm) {
    const it = new CreateSubjectForm();
    it.title = form.title;

    return it;
  }

  public static async validate(form: CreateSubjectForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
