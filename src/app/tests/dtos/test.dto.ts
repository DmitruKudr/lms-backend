import { StatusModelDto } from '../../../shared/dtos/status-model.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  TestAccessesEnum,
  TestPageFormatsEnum,
  TestResultTypesEnum,
  TestStatusesEnum,
} from '@prisma/client';
import { SubjectDto } from '../../subjects/dtos/subject.dto';
import { TeacherDto } from '../../teachers/dtos/teacher.dto';
import { TestItemDto } from './test-item.dto';
import { ITestModel } from '../types/test-model.interface';

export class TestDto extends StatusModelDto {
  @ApiProperty({
    description: 'Test title',
    example: 'Math equations test',
  })
  title: string;

  @ApiProperty({
    description: 'Test file (file name)',
    example: 'Equations_guide.pdf',
  })
  file: string;

  @ApiProperty({
    description: 'Test language (in lowercase!)',
    example: 'english',
  })
  language: string;

  @ApiProperty({
    description: 'Test duration (in minutes)',
    example: 30,
  })
  testDuration: number;

  @ApiProperty({
    description: 'Test text is selectable in browser',
  })
  textSelectable: boolean;

  @ApiProperty({
    description: 'Test access',
    enum: TestAccessesEnum,
  })
  access: TestAccessesEnum;

  @ApiProperty({
    description: 'Test page format',
    enum: TestPageFormatsEnum,
  })
  pageFormat: TestPageFormatsEnum;

  @ApiProperty({
    description: 'Test result type',
    enum: TestResultTypesEnum,
  })
  resultType: TestResultTypesEnum;

  @ApiProperty({
    description: 'Test status',
    enum: TestStatusesEnum,
  })
  testStatus: TestStatusesEnum;

  @ApiProperty({
    description: 'Test subject',
    type: SubjectDto,
  })
  subject?: SubjectDto;

  @ApiProperty({
    description: 'Test teacher (creator)',
    type: TeacherDto,
  })
  teacher?: TeacherDto;

  @ApiProperty({
    description: 'Test test-item list',
    type: TestItemDto,
    isArray: true,
  })
  testItemList: TestItemDto[];

  public static fromModel(model: ITestModel) {
    const it = super.fromModel(model) as TestDto;
    it.title = model.title;
    it.file = model.file;
    it.language = model.language;
    it.testDuration = model.testDuration;
    it.textSelectable = model.textSelectable;
    it.access = model.access;
    it.pageFormat = model.pageFormat;
    it.resultType = model.resultType;
    it.testStatus = model.testStatus;

    if (model.Subject && Object.keys(model.Subject)) {
      it.subject = SubjectDto.fromModel(model.Subject);
    }
    if (model.Teacher && Object.keys(model.Teacher)) {
      it.teacher = TeacherDto.fromModel(model.Teacher.User);
    }
    it.testItemList = TestItemDto.fromModels(model.TestItems);

    return it;
  }

  public static fromModels(models: ITestModel[]) {
    return !models?.map ? [] : models.map((model) => this.fromModel(model));
  }
}
