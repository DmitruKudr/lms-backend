import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UsersService } from '../users/users.service';
import { PayloadAccessDto } from '../security/dtos/payload-access.dto';
import { TeacherToStudentForm } from './dtos/teacher-to-student.form';
import {
  TeacherToStudentStatusesEnum,
  UserRolePermissionsEnum,
  UserRoleTypesEnum,
} from '@prisma/client';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { TeacherToStudentQueryDto } from './dtos/teacher-to-student-query.dto';
import { ITeacherToStudentModel } from './types/teacher-to-student-model.interface';

@Injectable()
export class ConnectionsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  // ===== teacher-to-student =====

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
        include: {
          Teacher: {
            select: {
              User: {
                include: {
                  Teacher: {
                    select: { institution: true, post: true, Subjects: true },
                  },
                  UserRole: { select: { title: true, type: true } },
                },
              },
            },
          },
          Student: {
            select: {
              User: {
                include: {
                  Student: { select: { institution: true, birthDate: true } },
                  UserRole: { select: { title: true, type: true } },
                },
              },
            },
          },
        },
      }) as unknown as ITeacherToStudentModel;
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
      include: {
        Teacher: {
          select: {
            User: {
              include: {
                Teacher: {
                  select: { institution: true, post: true, Subjects: true },
                },
                UserRole: { select: { title: true, type: true } },
              },
            },
          },
        },
        Student: {
          select: {
            User: {
              include: {
                Student: { select: { institution: true, birthDate: true } },
                UserRole: { select: { title: true, type: true } },
              },
            },
          },
        },
      },
    }) as unknown as ITeacherToStudentModel;
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
      include: {
        Teacher: query.studentId && {
          select: {
            User: {
              include: {
                Teacher: {
                  select: { institution: true, post: true, Subjects: true },
                },
                UserRole: { select: { title: true, type: true } },
              },
            },
          },
        },
        Student: query.teacherId && {
          select: {
            User: {
              include: {
                Student: { select: { institution: true, birthDate: true } },
                UserRole: { select: { title: true, type: true } },
              },
            },
          },
        },
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
    const teacherToStudent = (await this.prisma.teacherToStudent.findUnique({
      where: { id: id },
      include: {
        Teacher: {
          select: {
            User: {
              include: {
                Teacher: {
                  select: { institution: true, post: true, Subjects: true },
                },
                UserRole: { select: { title: true, type: true } },
              },
            },
          },
        },
        Student: {
          select: {
            User: {
              include: {
                Student: { select: { institution: true, birthDate: true } },
                UserRole: { select: { title: true, type: true } },
              },
            },
          },
        },
      },
    })) as ITeacherToStudentModel;

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
        return (await this.prisma.teacherToStudent.update({
          where: {
            id: id,
            confirmationStatus: { not: TeacherToStudentStatusesEnum.Confirmed },
          },
          data: { confirmationStatus: TeacherToStudentStatusesEnum.Confirmed },
          include: {
            Teacher: {
              select: {
                User: {
                  include: {
                    Teacher: {
                      select: { institution: true, post: true, Subjects: true },
                    },
                    UserRole: { select: { title: true, type: true } },
                  },
                },
              },
            },
            Student: {
              select: {
                User: {
                  include: {
                    Student: { select: { institution: true, birthDate: true } },
                    UserRole: { select: { title: true, type: true } },
                  },
                },
              },
            },
          },
        })) as ITeacherToStudentModel;
      }

      if (currentUser.roleType === UserRoleTypesEnum.Teacher) {
        return (await this.prisma.teacherToStudent.update({
          where: {
            id: id,
            teacherId: currentUser.id,
            confirmationStatus:
              TeacherToStudentStatusesEnum.NeedsTeacherConfirmation,
          },
          data: { confirmationStatus: TeacherToStudentStatusesEnum.Confirmed },
          include: {
            Student: {
              select: {
                User: {
                  include: {
                    Student: { select: { institution: true, birthDate: true } },
                    UserRole: { select: { title: true, type: true } },
                  },
                },
              },
            },
          },
        })) as ITeacherToStudentModel;
      }

      if (currentUser.roleType === UserRoleTypesEnum.Student) {
        return (await this.prisma.teacherToStudent.update({
          where: {
            id: id,
            studentId: currentUser.id,
            confirmationStatus:
              TeacherToStudentStatusesEnum.NeedsStudentConfirmation,
          },
          data: { confirmationStatus: TeacherToStudentStatusesEnum.Confirmed },
          include: {
            Teacher: {
              select: {
                User: {
                  include: {
                    Teacher: {
                      select: { institution: true, post: true, Subjects: true },
                    },
                    UserRole: { select: { title: true, type: true } },
                  },
                },
              },
            },
          },
        })) as ITeacherToStudentModel;
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
        return (await this.prisma.teacherToStudent.delete({
          where: {
            id: id,
          },
          include: {
            Teacher: {
              select: {
                User: {
                  include: {
                    Teacher: {
                      select: { institution: true, post: true, Subjects: true },
                    },
                    UserRole: { select: { title: true, type: true } },
                  },
                },
              },
            },
            Student: {
              select: {
                User: {
                  include: {
                    Student: { select: { institution: true, birthDate: true } },
                    UserRole: { select: { title: true, type: true } },
                  },
                },
              },
            },
          },
        })) as ITeacherToStudentModel;
      }

      if (currentUser.roleType === UserRoleTypesEnum.Teacher) {
        return (await this.prisma.teacherToStudent.delete({
          where: {
            id: id,
            teacherId: currentUser.id,
          },
          include: {
            Student: {
              select: {
                User: {
                  include: {
                    Student: { select: { institution: true, birthDate: true } },
                    UserRole: { select: { title: true, type: true } },
                  },
                },
              },
            },
          },
        })) as ITeacherToStudentModel;
      }

      if (currentUser.roleType === UserRoleTypesEnum.Student) {
        return (await this.prisma.teacherToStudent.delete({
          where: {
            id: id,
            studentId: currentUser.id,
          },
          include: {
            Teacher: {
              select: {
                User: {
                  include: {
                    Teacher: {
                      select: { institution: true, post: true, Subjects: true },
                    },
                    UserRole: { select: { title: true, type: true } },
                  },
                },
              },
            },
          },
        })) as ITeacherToStudentModel;
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
    const teacherToStudent = (await this.prisma.teacherToStudent.findFirst({
      where: { teacherId: teacherId, studentId: studentId },
    })) as ITeacherToStudentModel;
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
