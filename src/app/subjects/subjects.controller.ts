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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubjectDto } from './dtos/subject.dto';
import { CreateSubjectForm } from './dtos/create-subject.form';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { JwtPermissionsGuard } from '../security/guards/jwt-permissions.guard';
import { RequiredPermissions } from '../security/decorators/required-permissions.decorator';
import { UserRolePermissionsEnum } from '@prisma/client';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { UpdateSubjectForm } from './dtos/update-subject.form';

@ApiTags('subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new subject' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: SubjectDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.ManageSubjects)
  public async create(@Body() body: CreateSubjectForm) {
    const form = CreateSubjectForm.from(body);
    const errors = await CreateSubjectForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }

    const model = await this.subjectsService.create(form);

    return SubjectDto.fromModel(model);
  }

  @Get()
  @ApiOperation({ summary: 'Find all active subjects' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: SubjectDto,
    isArray: true,
  })
  public async findAllActive(@Query() query: BaseQueryDto) {
    const { models, remaining } = await this.subjectsService.findAllActive(
      query,
    );

    return { data: SubjectDto.fromModels(models), remaining };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find active subject with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: SubjectDto,
  })
  public async findActiveWithId(@Param('id') id: string) {
    const model = await this.subjectsService.findActiveWithId(id);

    return SubjectDto.fromModel(model);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subject with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: SubjectDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.ManageSubjects)
  public async updateWithId(
    @Param('id') id: string,
    @Body() body: UpdateSubjectForm,
  ) {
    const form = UpdateSubjectForm.from(body);
    const errors = await UpdateSubjectForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }

    const model = await this.subjectsService.updateWithId(id, form);

    return SubjectDto.fromModel(model);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Activate subject with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: SubjectDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.ManageSubjects)
  public async activateWithId(@Param('id') id: string) {
    const model = await this.subjectsService.activateWithId(id);

    return SubjectDto.fromModel(model);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive subject with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: SubjectDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.ManageSubjects)
  public async archiveWithId(@Param('id') id: string) {
    const model = await this.subjectsService.archiveWithId(id);

    return SubjectDto.fromModel(model);
  }
}
