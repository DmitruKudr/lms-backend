import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dtos/user.dto';
import { ITeacherModel } from '../types/teacher-model.interface';

export class TeacherDto extends UserDto {
  @ApiProperty({
    description: 'Teacher institution title',
    example: 'Stanford University',
  })
  institution: string;

  @ApiProperty({
    description: 'Teacher post (position)',
    example: 'Primary school teacher',
  })
  post: string;

  @ApiProperty({
    description: 'Teacher subjects to teach',
    example: ['math', 'physics'],
  })
  subjects: string[];

  public static fromModel(model: ITeacherModel, password?: string) {
    const it = super.fromModel(model, password) as TeacherDto;
    it.institution = model.Teacher.institution;
    it.post = model.Teacher.post;
    it.subjects = model.Subjects.map((subject) => subject.title);

    return it;
  }

  public static fromModels(models: ITeacherModel[]) {
    return !models?.map ? [] : models.map((model) => this.fromModel(model));
  }
}
