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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtPermissionsGuard } from '../security/guards/jwt-permissions.guard';
import { RequiredPermissions } from '../security/decorators/required-permissions.decorator';
import { UserRolePermissionsEnum } from '@prisma/client';
import { CreateDefaultUserForm } from './dtos/create-default-user.form';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { UserDto } from './dtos/user.dto';
import { CreateSpecialUserForm } from './dtos/create-special-user.form';
import { UserQueryDto } from './dtos/user-query.dto';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { JwtAdminPermissionsGuard } from '../security/guards/jwt-admin-permissions.guard';
import { RequiredAdminPermissions } from '../security/decorators/requierd-admin-permissions.decorator';
import { CurrentUser } from '../security/decorators/current-user.decorator';
import { PayloadAccessDto } from '../security/dtos/payload-access.dto';
import { ChangeEmailForm } from './dtos/change-email.form';
import { ChangePasswordForm } from './dtos/change-password-form';
import { ChangeUsernameForm } from './dtos/change-username.form';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileTypesEnum } from '../../shared/enums/file-types.enum';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('default-users')
  @ApiOperation({ summary: 'Create new default user { temporary }' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: UserDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.CreateDefaultUsers)
  public async createDefaultUser(@Body() body: CreateDefaultUserForm) {
    const form = CreateDefaultUserForm.from(body);
    const errors = await CreateDefaultUserForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }
    const model = await this.usersService.create(form);

    return UserDto.fromModel(model, form.password);
  }

  @Post('special-users')
  @ApiOperation({ summary: 'Create new special user { temporary }' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: UserDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.CreateSpecialUsers)
  public async createSpecialUser(@Body() body: CreateSpecialUserForm) {
    const form = CreateSpecialUserForm.from(body);
    const errors = await CreateSpecialUserForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }

    const model = await this.usersService.create(form);

    return UserDto.fromModel(model, form.password);
  }

  @Get()
  @ApiOperation({ summary: 'Find active users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: UserDto,
    isArray: true,
  })
  public async findActiveUsers(@Query() query: UserQueryDto) {
    const { models, remaining } = await this.usersService.findActiveUsers(
      query,
    );

    return { data: UserDto.fromModels(models), remaining };
  }

  @Get('admins')
  @ApiOperation({ summary: 'Find all admins' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: UserDto,
    isArray: true,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.ManageAdmins)
  public async findAllAdmins(@Query() query: BaseQueryDto) {
    const { models, remaining } = await this.usersService.findAllAdmins(query);

    return { data: UserDto.fromModels(models), remaining };
  }

  @Patch('username/:id')
  @ApiOperation({ summary: 'Change user username with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: UserDto,
  })
  @UseGuards(JwtAdminPermissionsGuard)
  @RequiredAdminPermissions(UserRolePermissionsEnum.ManageUsers)
  @RequiredPermissions(UserRolePermissionsEnum.ManageMyProfile)
  public async changeUsernameWithId(
    @Param('id') id: string,
    @Body() body: ChangeUsernameForm,
    @CurrentUser() currentUser: PayloadAccessDto,
  ) {
    const form = ChangeUsernameForm.from(body);
    const errors = await ChangeUsernameForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }

    const model = await this.usersService.changeUsernameWithId(
      id,
      form,
      currentUser,
    );

    return UserDto.fromModel(model);
  }

  @Patch('email/:id')
  @ApiOperation({ summary: 'Change user email with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: UserDto,
  })
  @UseGuards(JwtAdminPermissionsGuard)
  @RequiredAdminPermissions(UserRolePermissionsEnum.ManageUsers)
  @RequiredPermissions(UserRolePermissionsEnum.ManageMyProfile)
  public async changeEmailWithId(
    @Param('id') id: string,
    @Body() body: ChangeEmailForm,
    @CurrentUser() currentUser: PayloadAccessDto,
  ) {
    const form = ChangeEmailForm.from(body);
    const errors = await ChangeEmailForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }

    const model = await this.usersService.changeEmailWithId(
      id,
      form,
      currentUser,
    );

    return UserDto.fromModel(model);
  }

  @Patch('password/:id')
  @ApiOperation({ summary: 'Change user password with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: UserDto,
  })
  @UseGuards(JwtAdminPermissionsGuard)
  @RequiredAdminPermissions(UserRolePermissionsEnum.ManageUsers)
  @RequiredPermissions(UserRolePermissionsEnum.ManageMyProfile)
  public async changePasswordWithId(
    @Param('id') id: string,
    @Body() body: ChangePasswordForm,
    @CurrentUser() currentUser: PayloadAccessDto,
  ) {
    const form = ChangePasswordForm.from(body);
    const errors = await ChangePasswordForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }

    const model = await this.usersService.changePasswordWithId(
      id,
      form,
      currentUser,
    );

    return UserDto.fromModel(model, form.newPassword);
  }

  @Patch('avatar/:id')
  @ApiOperation({ summary: 'Change user avatar with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: UserDto,
  })
  @UseGuards(JwtAdminPermissionsGuard)
  @RequiredAdminPermissions(UserRolePermissionsEnum.ManageUsers)
  @RequiredPermissions(UserRolePermissionsEnum.ManageMyProfile)
  @UseInterceptors(FileInterceptor(FileTypesEnum.Avatar))
  public async changeAvatarWithId(
    @Param('id') id: string,
    @UploadedFile() avatar: Express.Multer.File,
    @CurrentUser() currentUser: PayloadAccessDto,
  ) {
    const model = await this.usersService.changeAvatarWithId(
      id,
      avatar,
      currentUser,
    );

    return UserDto.fromModel(model);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Activate user with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: UserDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.ArchiveEverything)
  public async activateWithId(@Param('id') id: string) {
    const model = await this.usersService.activateWithId(id);

    return UserDto.fromModel(model);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive user with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: UserDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.ArchiveEverything)
  public async archiveWithId(@Param('id') id: string) {
    const model = await this.usersService.archiveWithId(id);

    return UserDto.fromModel(model);
  }
}
