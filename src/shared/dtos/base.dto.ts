import { ApiProperty } from '@nestjs/swagger';

export class BaseDto {
  @ApiProperty({
    description: 'Uuid',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    description: 'Creation date',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last date of update',
  })
  updatedAt!: Date;

  public static fromModel(model: BaseDto) {
    const it = new BaseDto();
    it.id = model.id;
    it.createdAt = model.createdAt;
    it.updatedAt = model.updatedAt;

    return it;
  }

  public static fromModels(models?: BaseDto[]) {
    return !models?.length ? [] : models.map((model) => this.fromModel(model));
  }
}
