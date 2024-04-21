import { Test, Subject } from '@prisma/client';
import { ITestItemModel } from './test-item-model.interface';
import { ITeacherModel } from '../../teachers/types/teacher-model.interface';

export interface ITestModel extends Test {
  Subject: Subject;
  Teacher: { User: ITeacherModel };
  TestItems: ITestItemModel[];
}
