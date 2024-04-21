import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  validate,
  ValidateNested,
} from 'class-validator';
import {
  TestItemAnswerTypesEnum,
  TestItemMediaTypesEnum,
  TestItemOptionTypesEnum,
} from '@prisma/client';
import { CreateTestItemOptionForm } from './create-test-item-option.form';
import { Type } from 'class-transformer';

export class CreateTestItemForm {
  @ApiProperty({
    description: 'Test-item text',
    maxLength: 1000,
    example: 'Car is yellow',
    required: false,
  })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  text?: string;

  @ApiProperty({
    description: 'Test-item question',
    maxLength: 100,
    example: 'What color is the car?',
    required: false,
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  question?: string;

  @ApiProperty({
    description: 'Test-item points for the correct answer (or for all answers)',
    example: 5,
    required: false,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  points?: number;

  @ApiProperty({
    description: 'Test-item media (file name)',
    maxLength: 100,
    example: 'Car.png',
    required: false,
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  media?: string;

  @ApiProperty({
    description: 'Test-item media type',
    enum: TestItemMediaTypesEnum,
    required: false,
  })
  @IsEnum(TestItemMediaTypesEnum)
  @IsOptional()
  mediaType?: TestItemMediaTypesEnum;

  @ApiProperty({
    description: 'Test-item answer (or answers)',
    minItems: 1,
    maxItems: 10,
    maxLength: 100,
    example: ['yellow'],
    required: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  answers!: string[];

  @ApiProperty({
    description: 'Test-item answer (or all answers) type',
    enum: TestItemAnswerTypesEnum,
    required: true,
  })
  @IsEnum(TestItemAnswerTypesEnum)
  answerType!: TestItemAnswerTypesEnum;

  @ApiProperty({
    description: 'Test-item options',
    type: CreateTestItemOptionForm,
    isArray: true,
    maxItems: 5,
    required: false,
  })
  @IsArray()
  @ArrayMaxSize(5)
  @ArrayUnique()
  @Type(() => CreateTestItemOptionForm)
  @ValidateNested({ each: true })
  @IsOptional()
  options?: CreateTestItemOptionForm[];

  @ApiProperty({
    description: 'Test-item option type',
    enum: TestItemOptionTypesEnum,
    required: false,
  })
  @IsEnum(TestItemOptionTypesEnum)
  @IsOptional()
  optionType?: TestItemOptionTypesEnum;

  public static from(form: CreateTestItemForm) {
    const it = new CreateTestItemForm();
    it.text = form.text;
    it.question = form.question;
    it.points = form.points;

    it.media = form.media;
    it.mediaType = form.mediaType;

    it.answers = form.answers;
    it.answerType = form.answerType;

    it.options = CreateTestItemOptionForm.fromList(form.options);
    it.optionType = form.optionType;

    return it;
  }

  public static fromList(formList: CreateTestItemForm[]) {
    return !formList?.map ? [] : formList.map((form) => this.from(form));
  }

  public static async validate(form: CreateTestItemForm) {
    const errors = await validate(form);

    return errors?.length ? errors : null;
  }
}
