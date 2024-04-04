import { CreateSpecialStudentForm } from '../dtos/create-special-student.form';
import { CreateDefaultStudentForm } from '../dtos/create-default-student.form';

export type TCreateStudentForms =
  | CreateDefaultStudentForm
  | CreateSpecialStudentForm;
