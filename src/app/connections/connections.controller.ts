import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAdminPermissionsGuard } from '../security/guards/jwt-admin-permissions.guard';
import { RequiredAdminPermissions } from '../security/decorators/requierd-admin-permissions.decorator';
import { UserRolePermissionsEnum, UserRoleTypesEnum } from '@prisma/client';
import { RequiredPermissions } from '../security/decorators/required-permissions.decorator';
import { CurrentUser } from '../security/decorators/current-user.decorator';
import { PayloadAccessDto } from '../security/dtos/payload-access.dto';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { RequiredRoles } from '../security/decorators/required-roles.decorator';
import { AnyRequiredPermissionsMatch } from '../security/decorators/any-required-permissions-match.decorator';
import { TeacherToStudentForm } from './dtos/teacher-to-student.form';
import { TeacherToStudentDto } from './dtos/teacher-to-student.dto';
import { TeacherToStudentQueryDto } from './dtos/teacher-to-student-query.dto';

@ApiTags('connections')
@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post('teacher-to-student')
  @ApiOperation({ summary: 'Send teacher-to-student connection request' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: TeacherToStudentDto,
  })
  @UseGuards(JwtAdminPermissionsGuard)
  @RequiredAdminPermissions(UserRolePermissionsEnum.ManageUserProfiles)
  @RequiredRoles(UserRoleTypesEnum.Teacher, UserRoleTypesEnum.Student)
  @RequiredPermissions(
    UserRolePermissionsEnum.ConnectToTeachers,
    UserRolePermissionsEnum.ConnectToStudents,
  )
  @AnyRequiredPermissionsMatch()
  public async requestTeacherToStudent(
    @Body() body: TeacherToStudentForm,
    @CurrentUser() currentUser: PayloadAccessDto,
  ) {
    const form = TeacherToStudentForm.from(body);
    const errors = await TeacherToStudentForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }

    const model = await this.connectionsService.requestTeacherToStudent(
      form,
      currentUser,
    );

    return TeacherToStudentDto.fromModel(model);
  }

  @Get('teacher-to-student')
  @ApiOperation({ summary: 'Find all teacher-to-student connections' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: TeacherToStudentDto,
  })
  public async findAllTeacherToStudent(
    @Query() query: TeacherToStudentQueryDto,
  ) {
    const { models, remaining } =
      await this.connectionsService.findAllTeacherToStudent(query);

    return {
      data: TeacherToStudentDto.fromModels(models),
      remaining,
    };
  }

  @Get('teacher-to-student/:id')
  @ApiOperation({ summary: 'Find teacher-to-student connection with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: TeacherToStudentDto,
  })
  public async findTeacherToStudentWithId(@Param('id') id: string) {
    const model = await this.connectionsService.findTeacherToStudentWithId(id);

    return TeacherToStudentDto.fromModel(model);
  }

  @Patch('teacher-to-student/:id')
  @ApiOperation({ summary: 'Confirm teacher-to-student connection request' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: TeacherToStudentDto,
  })
  @UseGuards(JwtAdminPermissionsGuard)
  @RequiredAdminPermissions(UserRolePermissionsEnum.ManageUsers)
  @RequiredRoles(UserRoleTypesEnum.Teacher, UserRoleTypesEnum.Student)
  @RequiredPermissions(
    UserRolePermissionsEnum.ConnectToTeachers,
    UserRolePermissionsEnum.ConnectToStudents,
  )
  @AnyRequiredPermissionsMatch()
  public async confirmTeacherToStudentWithId(
    @Param('id') id: string,
    @CurrentUser() currentUser: PayloadAccessDto,
  ) {
    const model = await this.connectionsService.confirmTeacherToStudentWithId(
      id,
      currentUser,
    );

    return TeacherToStudentDto.fromModel(model);
  }

  @Delete('teacher-to-student/:id')
  @ApiOperation({ summary: 'Delete teacher-to-student connection' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: TeacherToStudentDto,
  })
  @UseGuards(JwtAdminPermissionsGuard)
  @RequiredAdminPermissions(UserRolePermissionsEnum.ManageUsers)
  @RequiredRoles(UserRoleTypesEnum.Teacher, UserRoleTypesEnum.Student)
  @RequiredPermissions(
    UserRolePermissionsEnum.ConnectToTeachers,
    UserRolePermissionsEnum.ConnectToStudents,
  )
  @AnyRequiredPermissionsMatch()
  public async deleteTeacherToStudentWithId(
    @Param('id') id: string,
    @CurrentUser() currentUser: PayloadAccessDto,
  ) {
    const model = await this.connectionsService.deleteTeacherToStudentWithId(
      id,
      currentUser,
    );

    return TeacherToStudentDto.fromModel(model);
  }
}
