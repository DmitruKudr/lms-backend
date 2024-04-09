import { ApiProperty } from '@nestjs/swagger';
import { IsLowercase, IsString, validate } from 'class-validator';

export class UpdateSubjectForm {
  @ApiProperty({
    description: 'Subject title (in lowercase!)',
    example: 'math',
  })
  @IsString()
  @IsLowercase()
  title!: string;

  public static from(form: UpdateSubjectForm) {
    const it = new UpdateSubjectForm();
    it.title = form.title;

    return it;
  }

  public static async validate(form: UpdateSubjectForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
