import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TestsService } from './tests.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAdminPermissionsGuard } from '../security/guards/jwt-admin-permissions.guard';
import { RequiredAdminPermissions } from '../security/decorators/requierd-admin-permissions.decorator';
import { UserRolePermissionsEnum, UserRoleTypesEnum } from '@prisma/client';
import { RequiredRoles } from '../security/decorators/required-roles.decorator';
import { RequiredPermissions } from '../security/decorators/required-permissions.decorator';
import { CreateTestForm } from './dtos/create-test.form';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileTypesEnum } from '../../shared/enums/file-types.enum';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { CurrentUser } from '../security/decorators/current-user.decorator';
import { PayloadAccessDto } from '../security/dtos/payload-access.dto';
import { TestDto } from './dtos/test.dto';

@ApiTags('tests')
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new test' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: TestDto,
  })
  @UseGuards(JwtAdminPermissionsGuard)
  @RequiredAdminPermissions(UserRolePermissionsEnum.CreateTests)
  @RequiredRoles(UserRoleTypesEnum.Teacher)
  @RequiredPermissions(UserRolePermissionsEnum.CreateMyTests)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: FileTypesEnum.TestFile, maxCount: 1 },
      { name: FileTypesEnum.TestItemFiles, maxCount: 30 },
      { name: FileTypesEnum.TestItemOptionFiles, maxCount: 150 },
    ]),
  )
  public async create(
    @Body() body: CreateTestForm,
    @CurrentUser() currentUser: PayloadAccessDto,
    @UploadedFiles()
    files: {
      [FileTypesEnum.TestFile]?: Express.Multer.File[];
      [FileTypesEnum.TestItemFiles]?: Express.Multer.File[];
      [FileTypesEnum.TestItemOptionFiles]?: Express.Multer.File[];
    },
  ) {
    const parsedBody = {};
    for (const key of Object.keys(body)) {
      try {
        parsedBody[key] = await JSON.parse(body[key]);
      } catch (e) {
        throw new BadRequestException({
          statusCode: 400,
          message: ErrorCodesEnum.InvalidJSON + `${key} - ${e.message}`,
        });
      }
    }

    const form = CreateTestForm.from(parsedBody);
    const errors = await CreateTestForm.validate(form, files);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }

    const model = await this.testsService.create(form, currentUser, files);

    return TestDto.fromModel(model);
  }
}
