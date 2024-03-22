import { BaseStatusesEnum } from '@prisma/client';

export interface IStatusModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: BaseStatusesEnum;
}
