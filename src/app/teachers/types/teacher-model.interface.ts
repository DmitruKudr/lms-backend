import { IUserModel } from '../../users/types/user-model.interface';
import { Subject, Teacher } from '@prisma/client';

export interface ITeacherModel extends IUserModel {
  Teacher: Teacher;

  Subjects: Subject[];
}
