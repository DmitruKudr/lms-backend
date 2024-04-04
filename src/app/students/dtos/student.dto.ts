import { ApiProperty } from '@nestjs/swagger';
import { IStudentModel } from '../types/student-model.interface';
import { UserDto } from '../../users/dtos/user.dto';

export class StudentDto extends UserDto {
  @ApiProperty({
    description: 'Student institution title',
    example: 'Stanford University',
  })
  institution: string;

  @ApiProperty({
    description: 'Student birth date',
    example: '2024-03-19T14:18:04.702Z',
  })
  birthDate: Date;

  public static fromModel(model: IStudentModel, password?: string) {
    const it = super.fromModel(model, password) as StudentDto;
    it.institution = model.Student.institution;
    it.birthDate = model.Student.birthDate;

    return it;
  }

  public static fromModels(models: IStudentModel[]) {
    return !models?.map ? [] : models.map((model) => this.fromModel(model));
  }
}
