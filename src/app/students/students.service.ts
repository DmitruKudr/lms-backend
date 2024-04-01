import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateSpecialStudentForm } from './dtos/create-special-student.form';
import { UsersService } from '../users/users.service';
import { BaseStatusesEnum, UserRoleTypesEnum } from '@prisma/client';
import { IStudentWithRole } from './types/student-with-role.interface';
import { hash } from 'argon2';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { UserRolesService } from '../user-roles/user-roles.service';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { FilesService } from '../files/files.service';
import { IFileValue } from '../../shared/types/file-value.interface';
import { UpdateStudentForm } from './dtos/update-student.form';
import { PayloadAccessDto } from '../security/dtos/payload-access.dto';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private userRolesService: UserRolesService,
    private filesService: FilesService,
  ) {}

  public async create(form: CreateSpecialStudentForm) {
    await this.usersService.doesActiveUserAlreadyExist({ email: form.email });

    const role = await this.userRolesService.findRoleWithTitle(form.roleTitle);
    if (role.type !== UserRoleTypesEnum.Student) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidRole + role.title,
      });
    }

    return (await this.prisma.user.create({
      data: {
        name: form.name,
        username: await this.usersService.generateUsername(form.name),
        email: form.email,
        password: await hash(form.password),
        roleId: role.id,

        Student: {
          create: {
            institution: form.institution,
            birthDate: form.birthDate,
          },
        },
      },
      include: {
        Student: { select: { institution: true, birthDate: true } },
        UserRole: { select: { title: true, type: true } },
      },
    })) as IStudentWithRole;
  }

  public async findActive(query: BaseQueryDto) {
    const take = query.pageSize || 10;
    const skip = ((query.pageNumber || 1) - 1) * take;

    const models = (await this.prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query.queryLine } },
              { username: { contains: query.queryLine } },
              { Student: { institution: { contains: query.queryLine } } },
            ],
          },
          { status: BaseStatusesEnum.Active },
          { UserRole: { type: UserRoleTypesEnum.Student } },
        ],
      },
      include: {
        Student: { select: { institution: true, birthDate: true } },
        UserRole: { select: { title: true, type: true } },
      },
      take: take,
      skip: skip,
    })) as IStudentWithRole[];

    let remaining = await this.prisma.user.count({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query.queryLine } },
              { username: { contains: query.queryLine } },
              { Student: { institution: { contains: query.queryLine } } },
            ],
          },
          { status: BaseStatusesEnum.Active },
          { UserRole: { type: UserRoleTypesEnum.Student } },
        ],
      },
    });
    remaining -= take + skip;

    return remaining > 0 ? { models, remaining } : { models, remaining: 0 };
  }

  public async findActiveWithId(id: string) {
    const model = (await this.prisma.user.findUnique({
      where: {
        id: id,
        status: BaseStatusesEnum.Active,
      },
      include: {
        Student: { select: { institution: true, birthDate: true } },
        UserRole: { select: { title: true, type: true } },
      },
    })) as IStudentWithRole;

    if (!model) {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'student',
      });
    }

    return model;
  }

  public async updateWithId(
    id: string,
    form: UpdateStudentForm,
    avatar: IFileValue,
    currentUser: PayloadAccessDto,
  ) {
    this.usersService.isCurrentUser(currentUser, id);
    await this.usersService.doesActiveUserAlreadyExist({
      email: form.email,
      username: form.username,
    });

    const fileName = await this.filesService.tempSaveFile(avatar);

    try {
      return (await this.prisma.user.update({
        where: { id: id, status: BaseStatusesEnum.Active },
        data: {
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password ? await hash(form.password) : undefined,
          avatar: fileName,
          Student: {
            update: {
              data: {
                institution: form.institution,
                birthDate: form.birthDate,
              },
            },
          },
        },
        include: {
          Student: { select: { birthDate: true, institution: true } },
          UserRole: { select: { title: true, type: true } },
        },
      })) as IStudentWithRole;
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + 'student',
      });
    }
  }
}
