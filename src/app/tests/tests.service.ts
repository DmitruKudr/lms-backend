import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateTestForm } from './dtos/create-test.form';
import { FileTypesEnum } from '../../shared/enums/file-types.enum';
import { PayloadAccessDto } from '../security/dtos/payload-access.dto';
import { UsersService } from '../users/users.service';
import { SubjectsService } from '../subjects/subjects.service';
import { CreateTestItemForm } from './dtos/create-test-item.form';
import {
  TestItemAnswerTypesEnum,
  TestItemOptionTypesEnum,
  UserRoleTypesEnum,
} from '@prisma/client';
import { FilesService } from '../files/files.service';
import { ITestModel } from './types/test-model.interface';

@Injectable()
export class TestsService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
    private usersService: UsersService,
    private subjectsService: SubjectsService,
  ) {}

  public async create(
    form: CreateTestForm,
    currentUser: PayloadAccessDto,
    files: { [key in FileTypesEnum]?: Express.Multer.File[] },
  ) {
    if (form.subjectId) {
      await this.subjectsService.findActiveWithId(form.subjectId);
    }

    if (form.file) {
      const { testFile } = files;
      form.file = await this.filesService.tempSaveFile(testFile[0]);
    }

    if (form.testItemList?.length) {
      for (const testItem of form.testItemList) {
        if (testItem.media) {
          const { testItemFiles } = files;
          testItem.media = await this.filesService.tempSaveFile(
            testItemFiles.find((file) => file.originalname === testItem.media),
          );
        }

        if (
          (testItem.answerType === TestItemAnswerTypesEnum.Radio ||
            testItem.answerType === TestItemAnswerTypesEnum.Checkbox) &&
          testItem.optionType !== TestItemOptionTypesEnum.Text
        ) {
          const { testItemOptionFiles } = files;
          for (const option of testItem.options) {
            option.media = await this.filesService.tempSaveFile(
              testItemOptionFiles.find(
                (file) => file.originalname === option.media,
              ),
            );
          }
        }
      }
    }

    const model = (await this.prisma.test.create({
      data: {
        title: form.title,
        language: form.language,
        testDuration: form.testDuration,
        textSelectable: form.textSelectable,
        access: form.access,
        pageFormat: form.pageFormat,
        resultType: form.resultType,
        testStatus: form.testStatus,
        subjectId: form.subjectId,
        teacherId:
          currentUser.roleType === UserRoleTypesEnum.Teacher
            ? currentUser.id
            : null,

        TestItems: {
          create: form.testItemList.map((testItem) => ({
            text: testItem.text,
            question: testItem.question,
            points: testItem.points,
            media: testItem.media,
            mediaType: testItem.mediaType,

            answerType: testItem.answerType,
            TestItemAnswers: {
              create:
                testItem.answerType === TestItemAnswerTypesEnum.Radio ||
                testItem.answerType === TestItemAnswerTypesEnum.Checkbox
                  ? testItem.answers.map((answer) => ({ text: answer }))
                  : { text: testItem.answers[0] },
            },

            optionType: testItem.optionType,
            TestItemOptions: testItem.options?.length
              ? { create: testItem.options }
              : {},
          })),
        },
      },
      include: {
        TestItems: {
          include: { TestItemAnswers: true, TestItemOptions: true },
        },
        Subject: true,
        Teacher: {
          select: {
            User: {
              include: {
                Teacher: {
                  select: { institution: true, post: true, Subjects: true },
                },
                UserRole: { select: { title: true, type: true } },
              },
            },
          },
        },
      },
    })) as unknown as ITestModel;

    return model;
  }
}
