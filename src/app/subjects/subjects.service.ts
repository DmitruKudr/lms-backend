import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateSubjectForm } from './dtos/create-subject.form';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { BaseStatusesEnum } from '@prisma/client';
import { UpdateSubjectForm } from './dtos/update-subject.form';
import { difference } from 'lodash';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  public async create(form: CreateSubjectForm) {
    await this.doesActiveSubjectAlreadyExist(form.title);

    return this.prisma.subject.create({
      data: { title: form.title },
    });
  }

  public async findAllActive(query: BaseQueryDto) {
    const take = query.pageSize || 10;
    const skip = ((query.pageNumber || 1) - 1) * take;

    const models = await this.prisma.subject.findMany({
      where: {
        title: { contains: query.queryLine },
        status: BaseStatusesEnum.Active,
      },
      take: take,
      skip: skip,
    });

    let remaining = await this.prisma.subject.count({
      where: {
        title: { contains: query.queryLine },
        status: BaseStatusesEnum.Active,
      },
    });
    remaining -= take + skip;

    return remaining > 0 ? { models, remaining } : { models, remaining: 0 };
  }

  public async findActiveWithId(id: string) {
    const model = await this.prisma.subject.findUnique({ where: { id: id } });

    if (!model) {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + `subject with id - ${id}`,
      });
    }

    return model;
  }

  public async updateWithId(id: string, form: UpdateSubjectForm) {
    await this.doesActiveSubjectAlreadyExist(form.title);

    try {
      return await this.prisma.subject.update({
        where: { id: id },
        data: { title: form.title },
      });
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + `subject with id - ${id}`,
      });
    }
  }

  public async activateWithId(id: string) {
    try {
      return await this.prisma.subject.update({
        where: { id: id },
        data: { status: BaseStatusesEnum.Active },
      });
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + `subject with id - ${id}`,
      });
    }
  }

  public async archiveWithId(id: string) {
    try {
      return await this.prisma.subject.update({
        where: { id: id },
        data: { status: BaseStatusesEnum.Archived },
      });
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + `subject with id - ${id}`,
      });
    }
  }

  public async doesActiveSubjectAlreadyExist(title: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { title: title },
    });

    if (subject) {
      throw new BadRequestException({
        statusCode: 400,
        message:
          ErrorCodesEnum.UniqueField + `subject title - ${subject.title}`,
      });
    }

    return subject;
  }

  public async findManyActiveWithTitleList(titleList: string[]) {
    if (!titleList) {
      return undefined;
    }

    const models = await this.prisma.subject.findMany({
      where: { title: { in: titleList }, status: BaseStatusesEnum.Active },
    });

    if (models.length !== titleList.length) {
      const missingSubjects = difference(
        titleList,
        models.map((model) => model.title),
      );
      throw new NotFoundException({
        statusCode: 404,
        message:
          ErrorCodesEnum.NotFound + `subjects - ${missingSubjects.join(', ')}`,
      });
    }

    return models;
  }
}
