import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtPermissionsGuard } from '../security/guards/jwt-permissions.guard';
import { RequiredPermissions } from '../security/decorators/required-permissions.decorator';
import { UserRolePermissionsEnum } from '@prisma/client';
import { CreateDefaultUserForm } from './dtos/create-default-user.form';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { UserWithRoleDto } from './dtos/user-with-role.dto';
import { CreateSpecialUserForm } from './dtos/create-special-user.form';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('default-users')
  @ApiOperation({ summary: 'Create new default user { temporary }' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: UserWithRoleDto,
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
    const model = await this.usersService.createUser(form);

    return UserWithRoleDto.fromModel(model, form.password);
  }

  @Post('special-users')
  @ApiOperation({ summary: 'Create new special user { temporary }' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: UserWithRoleDto,
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
    const model = await this.usersService.createUser(form);

    return UserWithRoleDto.fromModel(model, form.password);
  }

  @Get()
  @ApiOperation({ summary: 'Find all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: UserWithRoleDto,
    isArray: true,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.FindAllUsers)
  public async findAllUsers() {
    const models = await this.usersService.findAllUsers();

    return UserWithRoleDto.fromModels(models);
  }

  @Get('admins')
  @ApiOperation({ summary: 'Find all admins' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: UserWithRoleDto,
    isArray: true,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.ManageAdmins)
  public async findAllAdmins() {
    const models = await this.usersService.findAllAdmins();

    return UserWithRoleDto.fromModels(models);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Activate user with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: UserWithRoleDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.ArchiveEverything)
  public async activateWithId(@Param('id') id: string) {
    const model = await this.usersService.activateWithId(id);

    return UserWithRoleDto.fromModel(model);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive user with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: UserWithRoleDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.ArchiveEverything)
  public async archiveWithId(@Param('id') id: string) {
    const model = await this.usersService.archiveWithId(id);

    return UserWithRoleDto.fromModel(model);
  }
}
