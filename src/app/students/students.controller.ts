import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserWithRoleDto } from '../users/dtos/user-with-role.dto';
import { UserQueryDto } from '../users/dtos/user-query.dto';
import { JwtRolesGuard } from '../security/guards/jwt-roles.guard';
import { RequiredRoles } from '../security/decorators/required-roles.decorator';
import { UserRolePermissionsEnum, UserRoleTypesEnum } from '@prisma/client';
import { RequiredPermissions } from '../security/decorators/required-permissions.decorator';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}
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
  public async findActiveStudents() {
    return 'hello!';
  }
}
