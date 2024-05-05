import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateTestForm } from './dtos/create-test.form';
import { FileTypesEnum } from '../../shared/enums/file-types.enum';
import { PayloadAccessDto } from '../security/dtos/payload-access.dto';
import { UsersService } from '../users/users.service';
import { SubjectsService } from '../subjects/subjects.service';
import {
  BaseStatusesEnum,
  TestAccessesEnum,
  TestItemAnswerTypesEnum,
  TestItemOptionTypesEnum,
  TestStatusesEnum,
  UserRolePermissionsEnum,
  UserRoleTypesEnum,
} from '@prisma/client';
import { FilesService } from '../files/files.service';
import { ITestModel } from './types/test-model.interface';
import { TestQueryDto } from './dtos/test-query.dto';
import { intersection } from 'lodash';
import { TestDto } from './dtos/test.dto';

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
                Teacher: { include: { Subjects: true } },
                UserRole: true,
              },
            },
          },
        },
      },
    })) as ITestModel;

    return model;
  }

  public async findAllActive(
    query: TestQueryDto,
    currentUser: PayloadAccessDto,
  ) {
    const take = query.pageSize || 10;
    const skip = ((query.pageNumber || 1) - 1) * take;

    const models = (await this.prisma.test.findMany({
      where: {
        title: { contains: query.queryLine },
        language: { contains: query.language },
        testDuration: { lte: query.maxDuration || 300 },
        access: (function () {
          if (!currentUser) {
            return TestAccessesEnum.Open;
          }

          if (
            intersection(currentUser.permissions, [
              UserRolePermissionsEnum.All,
              UserRolePermissionsEnum.ManageTests,
            ]).length
          ) {
            return query.access || {};
          }

          switch (query.access) {
            case undefined: {
              if (currentUser.roleType === UserRoleTypesEnum.Teacher) {
                return {
                  in: [TestAccessesEnum.Open, TestAccessesEnum.TeachersOnly],
                };
              }

              if (currentUser.roleType === UserRoleTypesEnum.Student) {
                return {
                  in: [TestAccessesEnum.Open, TestAccessesEnum.MyStudentsOnly],
                };
              }

              return TestAccessesEnum.Open;
            }

            case TestAccessesEnum.TeachersOnly: {
              return currentUser.roleType === UserRoleTypesEnum.Teacher
                ? TestAccessesEnum.TeachersOnly
                : TestAccessesEnum.Open;
            }

            case TestAccessesEnum.MyStudentsOnly: {
              return currentUser.roleType === UserRoleTypesEnum.Student
                ? TestAccessesEnum.MyStudentsOnly
                : TestAccessesEnum.Open;
            }

            default: {
              return TestAccessesEnum.Open;
            }
          }
        })(),
        Teacher:
          query.onlyMyTeachers &&
          currentUser?.roleType === UserRoleTypesEnum.Student
            ? { Students: { some: { id: currentUser.id } } }
            : {},
        testStatus: query.testStatus || {},
        Subject: query.subjects?.length
          ? { OR: query.subjects.map((subject) => ({ title: subject })) }
          : {},
        // teacherId: query.teacherId,
        teacherId: query.teacherIds?.length ? { in: query.teacherIds } : {},
        status: BaseStatusesEnum.Active,
      },
      include: {
        // TestItems: {
        //   include: { TestItemAnswers: true, TestItemOptions: true },
        // },
        TestItems: true,
        Subject: true,
        Teacher: {
          select: {
            User: {
              include: {
                Teacher: { include: { Subjects: true } },
                UserRole: true,
              },
            },
          },
        },
      },
      take: take,
      skip: skip,
    })) as ITestModel[];

    let remaining = await this.prisma.test.count({
      where: {
        title: { contains: query.queryLine },
        language: { contains: query.language },
        testDuration: { lte: query.maxDuration || 300 },
        access: (function () {
          if (!currentUser) {
            return TestAccessesEnum.Open;
          }

          if (
            intersection(currentUser.permissions, [
              UserRolePermissionsEnum.All,
              UserRolePermissionsEnum.ManageTests,
            ]).length
          ) {
            return query.access || {};
          }

          switch (query.access) {
            case undefined: {
              if (currentUser.roleType === UserRoleTypesEnum.Teacher) {
                return {
                  in: [TestAccessesEnum.Hidden, TestAccessesEnum.TeachersOnly],
                };
              }

              if (currentUser.roleType === UserRoleTypesEnum.Student) {
                return {
                  in: [TestAccessesEnum.Open, TestAccessesEnum.MyStudentsOnly],
                };
              }

              return TestAccessesEnum.Open;
            }

            case TestAccessesEnum.TeachersOnly: {
              return currentUser.roleType === UserRoleTypesEnum.Teacher
                ? TestAccessesEnum.TeachersOnly
                : TestAccessesEnum.Open;
            }

            case TestAccessesEnum.MyStudentsOnly: {
              return currentUser.roleType === UserRoleTypesEnum.Student
                ? TestAccessesEnum.MyStudentsOnly
                : TestAccessesEnum.Open;
            }

            default: {
              return TestAccessesEnum.Open;
            }
          }
        })(),
        Teacher:
          query.onlyMyTeachers &&
          currentUser?.roleType === UserRoleTypesEnum.Student
            ? { Students: { some: { id: currentUser.id } } }
            : {},
        testStatus: query.testStatus || {},
        Subject: query.subjects?.length
          ? { OR: query.subjects.map((subject) => ({ title: subject })) }
          : {},
        // teacherId: query.teacherId,
        teacherId: query.teacherIds?.length ? { in: query.teacherIds } : {},
        status: BaseStatusesEnum.Active,
      },
    });
    remaining -= take + skip;

    return remaining > 0 ? { models, remaining } : { models, remaining: 0 };
  }
}
