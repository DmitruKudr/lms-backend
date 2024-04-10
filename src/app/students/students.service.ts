import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UsersService } from '../users/users.service';
import { BaseStatusesEnum, UserRoleTypesEnum } from '@prisma/client';
import { IStudentModel } from './types/student-model.interface';
import { hash } from 'argon2';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { UserRolesService } from '../user-roles/user-roles.service';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { UpdateStudentForm } from './dtos/update-student.form';
import { PayloadAccessDto } from '../security/dtos/payload-access.dto';
import { TCreateStudentForms } from './types/create-student-forms.type';
import { errorContext } from 'rxjs/internal/util/errorContext';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private userRolesService: UserRolesService,
  ) {}

  public async create(form: TCreateStudentForms) {
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
      include: { Student: true, UserRole: true },
    })) as IStudentModel;
  }

  public async findAllActive(query: BaseQueryDto) {
    const take = query.pageSize || 10;
    const skip = ((query.pageNumber || 1) - 1) * take;

    const models = (await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query.queryLine } },
          { username: { contains: query.queryLine } },
          { Student: { institution: { contains: query.queryLine } } },
        ],
        status: BaseStatusesEnum.Active,
        UserRole: { type: UserRoleTypesEnum.Student },
      },
      include: { Student: true, UserRole: true },
      take: take,
      skip: skip,
    })) as IStudentModel[];

    let remaining = await this.prisma.user.count({
      where: {
        OR: [
          { name: { contains: query.queryLine } },
          { username: { contains: query.queryLine } },
          { Student: { institution: { contains: query.queryLine } } },
        ],
        status: BaseStatusesEnum.Active,
        UserRole: { type: UserRoleTypesEnum.Student },
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
        UserRole: { type: UserRoleTypesEnum.Student },
      },
      include: { Student: true, UserRole: true },
    })) as IStudentModel;

    if (!model) {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + `student with id - ${id}`,
      });
    }

    return model;
  }

  public async updateActiveProfileWithId(
    id: string,
    form: UpdateStudentForm,
    currentUser: PayloadAccessDto,
  ) {
    this.usersService.isCurrentUser(currentUser, id);

    try {
      return (await this.prisma.user.update({
        where: {
          id: id,
          status: BaseStatusesEnum.Active,
          UserRole: { type: UserRoleTypesEnum.Student },
        },
        data: {
          name: form.name,

          Student: {
            update: {
              data: {
                institution: form.institution,
                birthDate: form.birthDate,
              },
            },
          },
        },
        include: { Student: true, UserRole: true },
      })) as IStudentModel;
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + `student with id - ${id}`,
      });
    }
  }
}
