import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ConnectionsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private userRolesService: UserRolesService,
    private filesService: FilesService,
  ) {}

  // ===== students =====

  public async requestTeacherToStudent(
    form: TeacherToStudentForm,
    currentUser: PayloadAccessDto,
  ) {
    this.usersService.isCurrentUser(
      currentUser,
      form.fromTeacher ? form.teacherId : form.studentId,
    );
    await this.usersService.findActiveUser(
      {
        id: form.teacherId,
        roleType: UserRoleTypesEnum.Teacher,
        permissions: [UserRolePermissionsEnum.ConnectToStudents],
      },
      'teacher',
    );
    await this.usersService.findActiveUser(
      {
        id: form.studentId,
        roleType: UserRoleTypesEnum.Student,
        permissions: [UserRolePermissionsEnum.ConnectToTeachers],
      },
      'student',
    );

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
}
