import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserWithRoleDto } from '../users/dtos/user-with-role.dto';
import { JwtRolesGuard } from '../security/guards/jwt-roles.guard';
import { RequiredRoles } from '../security/decorators/required-roles.decorator';
import { UserRolePermissionsEnum, UserRoleTypesEnum } from '@prisma/client';
import { RequiredPermissions } from '../security/decorators/required-permissions.decorator';
import { JwtPermissionsGuard } from '../security/guards/jwt-permissions.guard';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { CreateStudentForm } from './dtos/create-student.form';
import { StudentWithRoleDto } from './dtos/student-with-role.dto';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new student' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: UserWithRoleDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.CreateDefaultUsers)
  public async createDefaultUser(@Body() body: CreateStudentForm) {
    const form = CreateStudentForm.from(body);
    const errors = await CreateStudentForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }
    const model = await this.studentsService.create(form);

    return StudentWithRoleDto.fromModel(model, form.password);
  }
  @Get()
  @ApiOperation({ summary: 'Find active students' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: UserWithRoleDto,
    isArray: true,
  })
  @UseGuards(JwtRolesGuard)
  @RequiredRoles(UserRoleTypesEnum.Student)
  @RequiredPermissions(UserRolePermissionsEnum.FindAllUsers)
  public async findActive(@Query() query: BaseQueryDto) {
    const { models, remaining } = await this.studentsService.findActive(query);

    return { students: StudentWithRoleDto.fromModels(models), remaining };
  }
}
