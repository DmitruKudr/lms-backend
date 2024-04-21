import { ApiProperty } from '@nestjs/swagger';
import {
  TestItemAnswer,
  TestItemAnswerTypesEnum,
  TestItemMediaTypesEnum,
  TestItemOptionTypesEnum,
} from '@prisma/client';
import { TestItemOptionDto } from './test-item-option.dto';
import { BaseModelDto } from '../../../shared/dtos/base-model.dto';
import { ITestItemModel } from '../types/test-item-model.interface';
import { TestItemAnswerDto } from './test-item-answer.dto';

export class TestItemDto extends BaseModelDto {
  @ApiProperty({
    description: 'Test-item text',
    example: 'Car is yellow',
  })
  text: string;

  @ApiProperty({
    description: 'Test-item question',
    example: 'What color is the car?',
  })
  question: string;

  @ApiProperty({
    description: 'Test-item points for the correct answer (or for all answers)',
    example: 5,
  })
  points: number;

  @ApiProperty({
    description: 'Test-item media (file name)',
    example: 'Car.png',
  })
  media: string;

  @ApiProperty({
    description: 'Test-item media type',
    enum: TestItemMediaTypesEnum,
  })
  mediaType: TestItemMediaTypesEnum;

  @ApiProperty({
    description: 'Test-item media answer (or answers)',
    type: TestItemAnswerDto,
    isArray: true,
  })
  answers: TestItemAnswerDto[];

  @ApiProperty({
    description: 'Test-item answer type',
    enum: TestItemAnswerTypesEnum,
  })
  answerType: TestItemAnswerTypesEnum;

  @ApiProperty({
    description: 'Test-item options',
    type: TestItemOptionDto,
    isArray: true,
  })
  options: TestItemOptionDto[];

  @ApiProperty({
    description: 'Test-item option type',
    enum: TestItemOptionTypesEnum,
  })
  optionType?: TestItemOptionTypesEnum;

  public static fromModel(model: ITestItemModel) {
    const it = super.fromModel(model) as TestItemDto;
    it.text = model.text;
    it.question = model.question;
    it.points = model.points;
    it.media = model.media;
    it.mediaType = model.mediaType;
    it.answerType = model.answerType;
    it.optionType = model.optionType;

    it.answers = TestItemAnswerDto.fromModels(model.TestItemAnswers);
    it.options = TestItemOptionDto.fromModels(model.TestItemOptions);

    return it;
  }

  public static fromModels(models: ITestItemModel[]) {
    return !models?.map ? [] : models.map((model) => this.fromModel(model));
  }
}
