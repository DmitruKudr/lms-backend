import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAdminPermissionsGuard } from '../security/guards/jwt-admin-permissions.guard';
import { UserRolePermissionsEnum, UserRoleTypesEnum } from '@prisma/client';
import { RequiredPermissions } from '../security/decorators/required-permissions.decorator';
import { JwtPermissionsGuard } from '../security/guards/jwt-permissions.guard';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { CreateSpecialStudentForm } from './dtos/create-special-student.form';
import { StudentDto } from './dtos/student.dto';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { CreateDefaultStudentForm } from './dtos/create-default-student.form';
import { RequiredAdminPermissions } from '../security/decorators/requierd-admin-permissions.decorator';
import { UpdateStudentForm } from './dtos/update-student.form';
import { CurrentUser } from '../security/decorators/current-user.decorator';
import { PayloadAccessDto } from '../security/dtos/payload-access.dto';
import { RequiredRoles } from '../security/decorators/required-roles.decorator';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('default-students')
  @ApiOperation({ summary: 'Create new default student' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: StudentDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.CreateSpecialUsers)
  public async createDefaultStudent(@Body() body: CreateDefaultStudentForm) {
    const form = CreateDefaultStudentForm.from(body);
    const errors = await CreateDefaultStudentForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }
    const model = await this.studentsService.create(form);

    return StudentDto.fromModel(model, form.password);
  }

  @Post('special-students')
  @ApiOperation({ summary: 'Create new special student' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: StudentDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.CreateSpecialUsers)
  public async createSpecialStudent(@Body() body: CreateSpecialStudentForm) {
    const form = CreateSpecialStudentForm.from(body);
    const errors = await CreateSpecialStudentForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }
    const model = await this.studentsService.create(form);

    return StudentDto.fromModel(model, form.password);
  }
  @Get()
  @ApiOperation({ summary: 'Find all active students' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: StudentDto,
    isArray: true,
  })
  public async findAllActive(@Query() query: BaseQueryDto) {
    const { models, remaining } = await this.studentsService.findAllActive(
      query,
    );

    return { data: StudentDto.fromModels(models), remaining };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find active student with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: StudentDto,
    isArray: true,
  })
  public async findActiveWithId(@Param('id') id: string) {
    const model = await this.studentsService.findActiveWithId(id);

    return StudentDto.fromModel(model);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update student with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: StudentDto,
  })
  @UseGuards(JwtAdminPermissionsGuard)
  @RequiredAdminPermissions(UserRolePermissionsEnum.ManageUserProfiles)
  @RequiredRoles(UserRoleTypesEnum.Student)
  @RequiredPermissions(UserRolePermissionsEnum.ManageMyProfile)
  public async updateWithId(
    @Param('id') id: string,
    @Body() body: UpdateStudentForm,
    @CurrentUser() currentUser: PayloadAccessDto,
  ) {
    const form = UpdateStudentForm.from(body);
    const errors = await UpdateStudentForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }

    const model = await this.studentsService.updateWithId(
      id,
      form,
      currentUser,
    );

    return StudentDto.fromModel(model);
  }
}
