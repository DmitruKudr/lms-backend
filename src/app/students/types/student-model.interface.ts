import { IUserModel } from '../../users/types/user-model.interface';
import { Student } from '@prisma/client';

export interface IStudentModel extends IUserModel {
  Student: Student;
}
