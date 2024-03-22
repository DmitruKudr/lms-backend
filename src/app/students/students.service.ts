import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateStudentForm } from './dtos/create-student.form';
import { UsersService } from '../users/users.service';
import { BaseStatusesEnum, UserRoleTypesEnum } from '@prisma/client';
import { IStudentWithRole } from './types/student-with-role.interface';
import { hash } from 'argon2';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { UserRolesService } from '../user-roles/user-roles.service';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private userRolesService: UserRolesService,
  ) {}

  public async create(form: CreateStudentForm) {
    await this.usersService.doesUserExist(form.email);

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
            institution: 'Stanford University',
          },
        },
      },
      include: {
        Student: { select: { birthDate: true, institution: true } },
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
        Student: { select: { birthDate: true, institution: true } },
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
}
