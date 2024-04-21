import { TestItem, TestItemAnswer, TestItemOption } from '@prisma/client';

export interface ITestItemModel extends TestItem {
  TestItemAnswers: TestItemAnswer[];
  TestItemOptions: TestItemOption[];
}
