import { TeacherToStudentStatusesEnum } from '@prisma/client';
import { IStudentModel } from '../../students/types/student-model.interface';
import { IUserModel } from '../../users/types/user-model.interface';
import { IBaseModel } from '../../../shared/types/base-model.interface';

export interface ITeacherToStudentModel extends IBaseModel {
  teacherId: string;
  studentId: string;
  confirmationStatus: TeacherToStudentStatusesEnum;

  Teacher?: { User: ITeacherModel };
  Student?: { User: IStudentModel };
}

// ===== TODO remove next =====
interface ITeacherModel extends IUserModel {
  Teacher: {
    institution: string;
    post: string;
  };
}
// ===== before here =====
