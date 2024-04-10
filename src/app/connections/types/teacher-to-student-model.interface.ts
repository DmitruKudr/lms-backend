import { TeacherToStudentStatusesEnum } from '@prisma/client';
import { IStudentModel } from '../../students/types/student-model.interface';
import { IBaseModel } from '../../../shared/types/base-model.interface';
import { ITeacherModel } from '../../teachers/types/teacher-model.interface';

export interface ITeacherToStudentModel extends IBaseModel {
  teacherId: string;
  studentId: string;
  confirmationStatus: TeacherToStudentStatusesEnum;

  Teacher?: { User: ITeacherModel };
  Student?: { User: IStudentModel };
}
