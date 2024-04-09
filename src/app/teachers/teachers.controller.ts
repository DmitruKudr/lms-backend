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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAdminPermissionsGuard } from '../security/guards/jwt-admin-permissions.guard';
import { UserRolePermissionsEnum, UserRoleTypesEnum } from '@prisma/client';
import { RequiredPermissions } from '../security/decorators/required-permissions.decorator';
import { JwtPermissionsGuard } from '../security/guards/jwt-permissions.guard';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { RequiredAdminPermissions } from '../security/decorators/requierd-admin-permissions.decorator';
import { CurrentUser } from '../security/decorators/current-user.decorator';
import { PayloadAccessDto } from '../security/dtos/payload-access.dto';
import { RequiredRoles } from '../security/decorators/required-roles.decorator';
import { TeachersService } from './teachers.service';
import { TeacherDto } from './dtos/teacher.dto';
import { CreateDefaultTeacherForm } from './dtos/create-default-teacher.form';
import { CreateSpecialTeacherForm } from './dtos/create-special-teacher.form';
import { UpdateTeacherForm } from './dtos/update-teacher.form';
import { TeacherQueryDto } from './dtos/teacher-query.dto';

@ApiTags('teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post('default')
  @ApiOperation({ summary: 'Create new default teacher' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: TeacherDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.CreateSpecialUsers)
  public async createDefault(@Body() body: CreateDefaultTeacherForm) {
    const form = CreateDefaultTeacherForm.from(body);
    const errors = await CreateDefaultTeacherForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }
    const model = await this.teachersService.create(form);

    return TeacherDto.fromModel(model, form.password);
  }

  @Post('special')
  @ApiOperation({ summary: 'Create new special teacher' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: TeacherDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.CreateSpecialUsers)
  public async createSpecial(@Body() body: CreateSpecialTeacherForm) {
    const form = CreateSpecialTeacherForm.from(body);
    const errors = await CreateSpecialTeacherForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }
    const model = await this.teachersService.create(form);

    return TeacherDto.fromModel(model, form.password);
  }
  @Get()
  @ApiOperation({ summary: 'Find all active teachers' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: TeacherDto,
    isArray: true,
  })
  public async findAllActive(@Query() query: TeacherQueryDto) {
    const { models, remaining } = await this.teachersService.findAllActive(
      query,
    );

    return { data: TeacherDto.fromModels(models), remaining };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find active teacher with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: TeacherDto,
  })
  public async findActiveWithId(@Param('id') id: string) {
    const model = await this.teachersService.findActiveWithId(id);

    return TeacherDto.fromModel(model);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update active teacher profile with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: TeacherDto,
  })
  @UseGuards(JwtAdminPermissionsGuard)
  @RequiredAdminPermissions(UserRolePermissionsEnum.ManageUserProfiles)
  @RequiredRoles(UserRoleTypesEnum.Teacher)
  @RequiredPermissions(UserRolePermissionsEnum.ManageMyProfile)
  public async updateActiveProfileWithId(
    @Param('id') id: string,
    @Body() body: UpdateTeacherForm,
    @CurrentUser() currentUser: PayloadAccessDto,
  ) {
    const form = UpdateTeacherForm.from(body);
    const errors = await UpdateTeacherForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }

    const model = await this.teachersService.updateActiveProfileWithId(
      id,
      form,
      currentUser,
    );

    return TeacherDto.fromModel(model);
  }
}
