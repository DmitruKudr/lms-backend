import { ApiProperty } from '@nestjs/swagger';
import { BaseStatusesEnum } from '@prisma/client';

export class StatusModelDto {
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

  public static fromModel(model: StatusModelDto, ...args: any[]) {
    const it = new StatusModelDto();
    it.id = model.id;
    it.createdAt = model.createdAt;
    it.updatedAt = model.updatedAt;
    it.status = model.status;

    return it;
  }
}
