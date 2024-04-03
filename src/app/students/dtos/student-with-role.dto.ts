import { ApiProperty } from '@nestjs/swagger';
import { IStudentWithRole } from '../types/student-with-role.interface';
import { UserWithRoleDto } from '../../users/dtos/user-with-role.dto';

export class StudentWithRoleDto extends UserWithRoleDto {
  @ApiProperty({
    description: 'Student institution title',
    example: 'Stanford University',
  })
  institution?: string;

  @ApiProperty({
    description: 'Student birth date',
    example: '2024-03-19T14:18:04.702Z',
  })
  birthDate?: Date;

  public static fromModel(model: IStudentWithRole, password?: string) {
    const it = super.fromModel(model, password) as StudentWithRoleDto;
    it.institution = model.Student.institution;
    it.birthDate = model.Student.birthDate;

    return it;
  }

  public static fromModels(models: IStudentWithRole[]) {
    return !models?.map ? [] : models.map((model) => this.fromModel(model));
  }
}
