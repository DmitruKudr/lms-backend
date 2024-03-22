import { IUserWithRole } from '../../users/types/user-with-role.interface';

export interface IStudentWithRole extends IUserWithRole {
  Student: {
    birthDate?: Date;
    institution?: string;
  };
}
