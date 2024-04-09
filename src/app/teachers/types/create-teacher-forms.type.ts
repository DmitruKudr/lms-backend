import { CreateDefaultTeacherForm } from '../dtos/create-default-teacher.form';
import { CreateSpecialTeacherForm } from '../dtos/create-special-teacher.form';

export type TCreateTeacherForms =
  | CreateDefaultTeacherForm
  | CreateSpecialTeacherForm;
