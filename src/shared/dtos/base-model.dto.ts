import { ApiProperty } from '@nestjs/swagger';

export class BaseModelDto {
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

  public static fromModel(model: BaseModelDto, ...args: any[]) {
    const it = new BaseModelDto();
    it.id = model.id;
    it.createdAt = model.createdAt;
    it.updatedAt = model.updatedAt;

    return it;
  }
}
