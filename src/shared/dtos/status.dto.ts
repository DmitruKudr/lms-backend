import { ApiProperty } from '@nestjs/swagger';
import { BaseStatusesEnum } from '@prisma/client';

export class StatusDto {
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

  @ApiProperty({
    description: 'Status',
    enum: BaseStatusesEnum,
    isArray: false,
  })
  status!: BaseStatusesEnum;

  public static fromModel(model: StatusDto) {
    const it = new StatusDto();
    it.id = model.id;
    it.createdAt = model.createdAt;
    it.updatedAt = model.updatedAt;
    it.status = model.status;

    return it;
  }

  public static fromModels(models?: StatusDto[]) {
    return !models?.length ? [] : models.map((model) => this.fromModel(model));
  }
}
