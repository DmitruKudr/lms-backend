import { ApiProperty } from '@nestjs/swagger';
import { IStudentWithRole } from '../types/student-with-role.interface';
import { UserWithRoleDto } from '../../users/dtos/user-with-role.dto';

export class StudentWithRoleDto extends UserWithRoleDto {
  @ApiProperty({
    description: 'Student birth date',
    example: '2024-03-19T14:18:04.702Z',
  })
  birthDate?: Date;

  @ApiProperty({
    description: 'Student institution title',
    example: 'Stanford University',
  })
  institution?: string;

  public static fromModel(model: IStudentWithRole, password?: string) {
    const it = super.fromModel(model, password) as StudentWithRoleDto;
    it.birthDate = model.Student.birthDate;
    it.institution = model.Student.institution;

    return it;
  }

  public static fromModels(models: IStudentWithRole[]) {
    return !models?.map
      ? []
      : models.map((studentWithRole) => this.fromModel(studentWithRole));
  }
}
