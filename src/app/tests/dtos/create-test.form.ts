import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsLowercase,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
  validate,
} from 'class-validator';
import {
  TestAccessesEnum,
  TestItemAnswerTypesEnum,
  TestItemOptionTypesEnum,
  TestPageFormatsEnum,
  TestResultTypesEnum,
  TestStatusesEnum,
} from '@prisma/client';
import { CreateTestItemForm } from './create-test-item.form';
import { Type } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';
import { ErrorCodesEnum } from '../../../shared/enums/error-codes.enum';
import { FileTypesEnum } from '../../../shared/enums/file-types.enum';
import { difference } from 'lodash';

export class CreateTestForm {
  @ApiProperty({
    description: 'Test title',
    maxLength: 60,
    example: 'Math equations test',
    required: false,
  })
  @IsString()
  @MaxLength(60)
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Test file (file name)',
    maxLength: 100,
    example: 'Equations_guide.pdf',
    required: false,
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  file?: string;

  @ApiProperty({
    description: 'Test language (in lowercase!)',
    maxLength: 20,
    example: 'english',
    required: false,
  })
  @IsString()
  @MaxLength(20)
  @IsLowercase()
  @IsOptional()
  language?: string;

  @ApiProperty({
    description: 'Test duration (in minutes)',
    minimum: 1,
    maximum: 300,
    example: 30,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Max(300)
  @IsOptional()
  testDuration?: number;

  @ApiProperty({
    description: 'Test text is selectable in browser',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  textSelectable?: boolean;

  @ApiProperty({
    description: 'Test access',
    enum: TestAccessesEnum,
    required: false,
  })
  @IsEnum(TestAccessesEnum)
  @IsOptional()
  access?: TestAccessesEnum;

  @ApiProperty({
    description: 'Test page format',
    enum: TestPageFormatsEnum,
    required: false,
  })
  @IsEnum(TestPageFormatsEnum)
  @IsOptional()
  pageFormat?: TestPageFormatsEnum;

  @ApiProperty({
    description: 'Test result type',
    enum: TestResultTypesEnum,
    required: false,
  })
  @IsEnum(TestResultTypesEnum)
  @IsOptional()
  resultType?: TestResultTypesEnum;

  @ApiProperty({
    description: 'Test status',
    enum: TestStatusesEnum,
    required: false,
  })
  @IsEnum(TestStatusesEnum)
  @IsOptional()
  testStatus?: TestStatusesEnum;

  @ApiProperty({
    description: 'Test subject id',
    format: 'uuid4',
    example: '3d507c19-47d8-490f-8171-23bfaa91562a',
    required: false,
  })
  @IsUUID(4)
  @IsOptional()
  subjectId?: string;

  @ApiProperty({
    description: 'Test test-item list',
    type: CreateTestForm,
    isArray: true,
    maxItems: 30,
    required: false,
  })
  @IsArray()
  @ArrayMaxSize(30)
  @ArrayUnique()
  @Type(() => CreateTestItemForm)
  @ValidateNested({ each: true })
  @IsOptional()
  testItemList?: CreateTestItemForm[];

  public static from(form: CreateTestForm) {
    const it = new CreateTestForm();
    it.title = form.title || 'New test';
    it.file = form.file;
    it.language = form.language;
    it.testDuration = form.testDuration;
    it.textSelectable = form.textSelectable || false;
    it.access = form.access || TestAccessesEnum.Hidden;
    it.pageFormat = form.pageFormat || TestPageFormatsEnum.SinglePage;
    it.resultType = form.resultType || TestResultTypesEnum.Percents;
    it.testStatus = form.testStatus || TestStatusesEnum.InCreation;
    it.subjectId = form.subjectId;

    it.testItemList = CreateTestItemForm.fromList(form.testItemList);

    return it;
  }

  public static async validate(
    form: CreateTestForm,
    files: { [key in FileTypesEnum]?: Express.Multer.File[] },
  ) {
    const errors = await validate(form);
    if (errors?.length) {
      return errors;
    }

    if (form.file) {
      const { testFile } = files;
      if (form.file !== testFile[0].originalname) {
        throw new BadRequestException({
          statusCode: 400,
          message:
            ErrorCodesEnum.FileIsNotProvided + `for test file '${form.file}'`,
        });
      }
    }

    if (form.testItemList?.length) {
      form.testItemList.forEach((testItem) => {
        if (testItem.media && testItem.mediaType) {
          const { testItemFiles } = files;
          if (
            !testItemFiles.find((file) => file.originalname === testItem.media)
          ) {
            throw new BadRequestException({
              statusCode: 400,
              message: ErrorCodesEnum.FileIsNotProvided + testItem.media,
            });
          }
        }

        if (
          testItem.answerType === TestItemAnswerTypesEnum.Number &&
          isNaN(+testItem.answers[0])
        ) {
          throw new BadRequestException({
            statusCode: 400,
            message:
              ErrorCodesEnum.InvalidTestItemAnswer +
              `test-item ${form.testItemList.indexOf(testItem) + 1} answer '${
                testItem.answers[0]
              }' must be a numeric string`,
          });
        }

        if (
          testItem.answerType === TestItemAnswerTypesEnum.Radio ||
          testItem.answerType === TestItemAnswerTypesEnum.Checkbox
        ) {
          if (!testItem.options?.length) {
            throw new BadRequestException({
              statusCode: 400,
              message:
                ErrorCodesEnum.TestItemOptionsAreNotProvided +
                `for test-item ${form.testItemList.indexOf(testItem) + 1}`,
            });
          }

          switch (testItem.optionType) {
            case TestItemOptionTypesEnum.Text: {
              const lackingOptions = difference(
                testItem.answers,
                testItem.options.map((option) => option.text),
              );
              if (lackingOptions.length) {
                throw new BadRequestException({
                  statusCode: 400,
                  message:
                    ErrorCodesEnum.TestItemOptionsAreNotProvided +
                    `test-item ${
                      form.testItemList.indexOf(testItem) + 1
                    } for answer(s) ${lackingOptions.join(', ')}`,
                });
              }

              break;
            }

            case TestItemOptionTypesEnum.Image: {
              const { testItemOptionFiles } = files;
              const lackingFiles = difference(
                testItem.options.map((option) => option.media),
                testItemOptionFiles.map((file) => file.originalname),
              );
              if (lackingFiles.length) {
                throw new BadRequestException({
                  statusCode: 400,
                  message:
                    ErrorCodesEnum.TestItemOptionsAreNotProvided +
                    `test-item ${
                      form.testItemList.indexOf(testItem) + 1
                    } for option(s) ${lackingFiles.join(', ')}`,
                });
              }

              const lackingOptions = difference(
                testItem.answers,
                testItem.options.map((option) => option.media),
              );
              if (lackingOptions.length) {
                throw new BadRequestException({
                  statusCode: 400,
                  message:
                    ErrorCodesEnum.TestItemOptionsAreNotProvided +
                    `test-item ${
                      form.testItemList.indexOf(testItem) + 1
                    } for answer(s) ${lackingOptions.join(', ')}`,
                });
              }

              break;
            }

            default: {
              throw new BadRequestException({
                statusCode: 400,
                message:
                  ErrorCodesEnum.UnknownTestItemOptionType +
                  `for test-item ${form.testItemList.indexOf(testItem) + 1}`,
              });
            }
          }
        }
      });
    }

    return null;
  }
}
