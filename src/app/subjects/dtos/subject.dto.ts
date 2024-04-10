import { StatusModelDto } from '../../../shared/dtos/status-model.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SubjectDto extends StatusModelDto {
  @ApiProperty({
    description: 'Subject title',
    example: 'math',
  })
  title: string;

  public static fromModel(model: SubjectDto) {
    const it = super.fromModel(model) as SubjectDto;
    it.title = model.title;

    return it;
  }

  public static fromModels(models: SubjectDto[]) {
    return !models?.map ? [] : models.map((model) => this.fromModel(model));
  }
}
