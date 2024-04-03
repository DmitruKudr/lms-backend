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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAdminPermissionsGuard } from '../security/guards/jwt-admin-permissions.guard';
import { UserRolePermissionsEnum } from '@prisma/client';
import { RequiredPermissions } from '../security/decorators/required-permissions.decorator';
import { JwtPermissionsGuard } from '../security/guards/jwt-permissions.guard';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { CreateSpecialStudentForm } from './dtos/create-special-student.form';
import { StudentWithRoleDto } from './dtos/student-with-role.dto';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { CreateDefaultStudentForm } from './dtos/create-default-student.form';
import { RequiredAdminPermissions } from '../security/decorators/requierd-admin-permissions.decorator';
import { UpdateStudentForm } from './dtos/update-student.form';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../security/decorators/current-user.decorator';
import { PayloadAccessDto } from '../security/dtos/payload-access.dto';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('default-students')
  @ApiOperation({ summary: 'Create new default student' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: StudentWithRoleDto,
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

    return StudentWithRoleDto.fromModel(model, form.password);
  }

  @Post('special-students')
  @ApiOperation({ summary: 'Create new special student' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: StudentWithRoleDto,
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

    return StudentWithRoleDto.fromModel(model, form.password);
  }
  @Get()
  @ApiOperation({ summary: 'Find active students' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: StudentWithRoleDto,
    isArray: true,
  })
  public async findActive(@Query() query: BaseQueryDto) {
    const { models, remaining } = await this.studentsService.findActive(query);

    return { data: StudentWithRoleDto.fromModels(models), remaining };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find active student with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: StudentWithRoleDto,
    isArray: true,
  })
  public async findActiveWithId(@Param('id') id: string) {
    const model = await this.studentsService.findActiveWithId(id);

    return StudentWithRoleDto.fromModel(model);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update student with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: StudentWithRoleDto,
  })
  @UseGuards(JwtAdminPermissionsGuard)
  @RequiredAdminPermissions(UserRolePermissionsEnum.ManageUserProfiles)
  @RequiredPermissions(UserRolePermissionsEnum.ManageMyProfile)
  @UseInterceptors(FileInterceptor('avatar'))
  public async updateWithId(
    @Param('id') id: string,
    @Body() body: UpdateStudentForm,
    @UploadedFile() avatar: Express.Multer.File,
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
      avatar,
      currentUser,
    );

    return StudentWithRoleDto.fromModel(model, form.password);
  }
}
