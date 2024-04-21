import { ApiProperty } from '@nestjs/swagger';
import { BaseModelDto } from '../../../shared/dtos/base-model.dto';
import { TestItemOption } from '@prisma/client';

export class TestItemOptionDto extends BaseModelDto {
  @ApiProperty({
    description: 'Test-item option text',
    example: 'Yellow',
  })
  text: string;

  @ApiProperty({
    description: 'Test-item option media (file name)',
    example: 'Yellow.png',
  })
  media: string;

  public static fromModel(model: TestItemOption) {
    const it = super.fromModel(model) as TestItemOptionDto;
    it.text = model.text;
    it.media = model.media;

    return it;
  }

  public static fromModels(models: TestItemOption[]) {
    return !models?.map ? [] : models.map((model) => this.fromModel(model));
  }
}
