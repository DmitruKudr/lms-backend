import { CreateDefaultUserForm } from '../dtos/create-default-user.form';
import { CreateSpecialUserForm } from '../dtos/create-special-user.form';

export type CreateUserFormTypes = CreateDefaultUserForm | CreateSpecialUserForm;
