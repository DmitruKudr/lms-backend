import { ApiProperty } from '@nestjs/swagger';
import { BaseModelDto } from '../../../shared/dtos/base-model.dto';
import { TestItemAnswer } from '@prisma/client';

export class TestItemAnswerDto extends BaseModelDto {
  @ApiProperty({
    description: 'Test-item answer text',
    example: 'Yellow',
  })
  text: string;
  public static fromModel(model: TestItemAnswer) {
    const it = super.fromModel(model) as TestItemAnswerDto;
    it.text = model.text;

    return it;
  }

  public static fromModels(models: TestItemAnswer[]) {
    return !models?.map ? [] : models.map((model) => this.fromModel(model));
  }
}
