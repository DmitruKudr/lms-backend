import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UsersService } from '../users/users.service';
import { UserRolesService } from '../user-roles/user-roles.service';
import { FilesService } from '../files/files.service';
import { PayloadAccessDto } from '../security/dtos/payload-access.dto';
import { TeacherToStudentForm } from './dtos/teacher-to-student.form';
import {
  TeacherToStudentStatusesEnum,
  UserRolePermissionsEnum,
  UserRoleTypesEnum,
} from '@prisma/client';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { TeacherToStudentQueryDto } from './dtos/teacher-to-student-query.dto';

@Injectable()
export class ConnectionsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  // ===== teacher to student =====

  public async requestTeacherToStudent(
    form: TeacherToStudentForm,
    currentUser: PayloadAccessDto,
  ) {
    if (currentUser.roleType === UserRoleTypesEnum.Teacher) {
      this.usersService.isCurrentUser(currentUser, form.teacherId);
    }
    if (currentUser.roleType === UserRoleTypesEnum.Student) {
      this.usersService.isCurrentUser(currentUser, form.studentId);
    }

    await this.doesTeacherToStudentAlreadyExist(form.teacherId, form.studentId);

    await this.usersService.findActiveUser({
      id: form.teacherId,
      roleType: UserRoleTypesEnum.Teacher,
      permissions: [UserRolePermissionsEnum.ConnectToStudents],
    });
    await this.usersService.findActiveUser({
      id: form.studentId,
      roleType: UserRoleTypesEnum.Student,
      permissions: [UserRolePermissionsEnum.ConnectToTeachers],
    });

    if (currentUser.roleType === UserRoleTypesEnum.Admin) {
      return this.prisma.teacherToStudent.create({
        data: {
          teacherId: form.teacherId,
          studentId: form.studentId,
          confirmationStatus: form.fromTeacher
            ? TeacherToStudentStatusesEnum.NeedsStudentConfirmation
            : TeacherToStudentStatusesEnum.NeedsTeacherConfirmation,
        },
      });
    }

    return this.prisma.teacherToStudent.create({
      data: {
        teacherId: form.teacherId,
        studentId: form.studentId,
        confirmationStatus:
          currentUser.roleType === UserRoleTypesEnum.Teacher
            ? TeacherToStudentStatusesEnum.NeedsStudentConfirmation
            : TeacherToStudentStatusesEnum.NeedsTeacherConfirmation,
      },
    });
  }

  public async findAllTeacherToStudent(query: TeacherToStudentQueryDto) {
    const take = query.pageSize || 10;
    const skip = ((query.pageNumber || 1) - 1) * take;

    const models = await this.prisma.teacherToStudent.findMany({
      where: {
        teacherId: query.teacherId,
        studentId: query.studentId,
        confirmationStatus: query.confirmationStatus,
      },
      take: take,
      skip: skip,
    });

    let remaining = await this.prisma.teacherToStudent.count({
      where: {
        teacherId: query.teacherId,
        studentId: query.studentId,
        confirmationStatus: query.confirmationStatus,
      },
    });
    remaining -= take + skip;

    return remaining > 0 ? { models, remaining } : { models, remaining: 0 };
  }

  public async findTeacherToStudentWithId(id: string) {
    const teacherToStudent = await this.prisma.teacherToStudent.findUnique({
      where: { id: id },
    });

    if (!teacherToStudent) {
      throw new BadRequestException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + `teacher-to-student ${id}`,
      });
    }

    return teacherToStudent;
  }

  public async confirmTeacherToStudentWithId(
    id: string,
    currentUser: PayloadAccessDto,
  ) {
    try {
      if (currentUser.roleType === UserRoleTypesEnum.Admin) {
        return await this.prisma.teacherToStudent.update({
          where: {
            id: id,
            confirmationStatus: { not: TeacherToStudentStatusesEnum.Confirmed },
          },
          data: { confirmationStatus: TeacherToStudentStatusesEnum.Confirmed },
        });
      }

      if (currentUser.roleType === UserRoleTypesEnum.Teacher) {
        return await this.prisma.teacherToStudent.update({
          where: {
            id: id,
            teacherId: currentUser.id,
            confirmationStatus:
              TeacherToStudentStatusesEnum.NeedsTeacherConfirmation,
          },
          data: { confirmationStatus: TeacherToStudentStatusesEnum.Confirmed },
        });
      }

      if (currentUser.roleType === UserRoleTypesEnum.Student) {
        return await this.prisma.teacherToStudent.update({
          where: {
            id: id,
            studentId: currentUser.id,
            confirmationStatus:
              TeacherToStudentStatusesEnum.NeedsStudentConfirmation,
          },
          data: { confirmationStatus: TeacherToStudentStatusesEnum.Confirmed },
        });
      }

      throw new Error('Unknown role type');
    } catch {
      throw new BadRequestException({
        statusCode: 404,
        message:
          ErrorCodesEnum.NotFound +
          `teacher-to-student with id ${id} that needs your confirmation`,
      });
    }
  }

  public async deleteTeacherToStudentWithId(
    id: string,
    currentUser: PayloadAccessDto,
  ) {
    try {
      if (currentUser.roleType === UserRoleTypesEnum.Admin) {
        return await this.prisma.teacherToStudent.delete({
          where: {
            id: id,
          },
        });
      }

      if (currentUser.roleType === UserRoleTypesEnum.Teacher) {
        return await this.prisma.teacherToStudent.delete({
          where: {
            id: id,
            teacherId: currentUser.id,
          },
        });
      }

      if (currentUser.roleType === UserRoleTypesEnum.Student) {
        return await this.prisma.teacherToStudent.delete({
          where: {
            id: id,
            studentId: currentUser.id,
          },
        });
      }

      throw new Error('Unknown role type');
    } catch {
      throw new BadRequestException({
        statusCode: 404,
        message: ErrorCodesEnum.NotFound + `teacher-to-student with id ${id}`,
      });
    }
  }

  public async doesTeacherToStudentAlreadyExist(
    teacherId: string,
    studentId: string,
  ) {
    const teacherToStudent = await this.prisma.teacherToStudent.findFirst({
      where: { teacherId: teacherId, studentId: studentId },
    });
    if (teacherToStudent) {
      throw new BadRequestException({
        statusCode: 400,
        message:
          ErrorCodesEnum.ConnectionAlreadyExists +
          `${teacherToStudent.id}, status - ${teacherToStudent.confirmationStatus}`,
      });
    }

    return teacherToStudent;
  }
}
