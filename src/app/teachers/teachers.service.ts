import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UsersService } from '../users/users.service';
import { BaseStatusesEnum, UserRoleTypesEnum } from '@prisma/client';
import { hash } from 'argon2';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { UserRolesService } from '../user-roles/user-roles.service';
import { PayloadAccessDto } from '../security/dtos/payload-access.dto';
import { TCreateTeacherForms } from './types/create-teacher-forms.type';
import { ITeacherModel } from './types/teacher-model.interface';
import { UpdateTeacherForm } from './dtos/update-teacher.form';
import { TeacherQueryDto } from './dtos/teacher-query.dto';
import { SubjectsService } from '../subjects/subjects.service';

@Injectable()
export class TeachersService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private userRolesService: UserRolesService,
    private subjectsService: SubjectsService,
  ) {}

  public async create(form: TCreateTeacherForms) {
    await this.usersService.doesActiveUserAlreadyExist({ email: form.email });

    const role = await this.userRolesService.findRoleWithTitle(form.roleTitle);
    if (role.type !== UserRoleTypesEnum.Teacher) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidRole + role.title,
      });
    }

    const subjects = await this.subjectsService.findManyActiveWithTitleList(
      form.subjects,
    );

    return (await this.prisma.user.create({
      data: {
        name: form.name,
        username: await this.usersService.generateUsername(form.name),
        email: form.email,
        password: await hash(form.password),
        roleId: role.id,

        Teacher: {
          create: {
            institution: form.institution,
            post: form.post,
            Subjects: { connect: subjects },
          },
        },
      },
      include: { Teacher: { include: { Subjects: true } }, UserRole: true },
    })) as ITeacherModel;
  }

  public async findAllActive(query: TeacherQueryDto) {
    const take = query.pageSize || 10;
    const skip = ((query.pageNumber || 1) - 1) * take;

    const models = (await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query.queryLine } },
          { username: { contains: query.queryLine } },
          { Teacher: { institution: { contains: query.queryLine } } },
          { Teacher: { post: { contains: query.queryLine } } },
        ],
        Teacher: query.subjects?.length
          ? {
              AND: [
                // { Subjects: { some: {} } },
                // { Subjects: { every: { title: { in: query.subjects } } } },
                ...query.subjects.map((subject) => ({
                  Subjects: { some: { title: subject } },
                })),
              ],
            }
          : {},
        status: BaseStatusesEnum.Active,
        UserRole: { type: UserRoleTypesEnum.Teacher },
      },
      include: { Teacher: { include: { Subjects: true } }, UserRole: true },
      take: take,
      skip: skip,
    })) as ITeacherModel[];

    let remaining = await this.prisma.user.count({
      where: {
        OR: [
          { name: { contains: query.queryLine } },
          { username: { contains: query.queryLine } },
          { Teacher: { institution: { contains: query.queryLine } } },
          { Teacher: { post: { contains: query.queryLine } } },
        ],
        Teacher: query.subjects?.length
          ? {
              AND: [
                // { Subjects: { some: {} } },
                // { Subjects: { every: { title: { in: query.subjects } } } },
                ...query.subjects.map((subject) => ({
                  Subjects: { some: { title: subject } },
                })),
              ],
            }
          : {},
        status: BaseStatusesEnum.Active,
        UserRole: { type: UserRoleTypesEnum.Teacher },
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
        UserRole: { type: UserRoleTypesEnum.Teacher },
      },
      include: { Teacher: { include: { Subjects: true } }, UserRole: true },
    })) as ITeacherModel;

    if (!model) {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + `teacher with id - ${id}`,
      });
    }

    return model;
  }

  public async updateActiveProfileWithId(
    id: string,
    form: UpdateTeacherForm,
    currentUser: PayloadAccessDto,
  ) {
    this.usersService.isCurrentUser(currentUser, id);

    const newSubjects = await this.subjectsService.findManyActiveWithTitleList(
      form.subjects,
    );

    try {
      return (await this.prisma.user.update({
        where: {
          id: id,
          status: BaseStatusesEnum.Active,
          UserRole: { type: UserRoleTypesEnum.Teacher },
        },
        data: {
          name: form.name,

          Teacher: {
            update: {
              data: {
                institution: form.institution,
                post: form.post,
                Subjects: Array.isArray(newSubjects)
                  ? { set: newSubjects }
                  : {},
              },
            },
          },
        },
        include: { Teacher: { include: { Subjects: true } }, UserRole: true },
      })) as ITeacherModel;
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + `teacher with id - ${id}`,
      });
    }
  }
}
