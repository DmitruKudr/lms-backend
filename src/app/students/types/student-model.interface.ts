import { IUserModel } from '../../users/types/user-model.interface';

export interface IStudentModel extends IUserModel {
  Student: {
    birthDate?: Date;
    institution?: string;
  };
}
