import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, validate } from 'class-validator';

export class CreateTestItemOptionForm {
  @ApiProperty({
    description: 'Test-item option text',
    maxLength: 100,
    example: 'Yellow',
    required: false,
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  text?: string;

  @ApiProperty({
    description: 'Test-item option media (file name)',
    maxLength: 100,
    example: 'Yellow.png',
    required: false,
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  media?: string;

  public static from(form: CreateTestItemOptionForm) {
    const it = new CreateTestItemOptionForm();
    it.text = form.text;
    it.media = form.media;

    return it;
  }

  public static fromList(formList: CreateTestItemOptionForm[]) {
    return !formList?.map ? [] : formList.map((form) => this.from(form));
  }

  public static async validate(form: CreateTestItemOptionForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
