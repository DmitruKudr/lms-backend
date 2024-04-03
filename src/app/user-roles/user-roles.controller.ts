import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Put,
  Query,
} from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { CreateUserRoleForm } from './dtos/create-user-role.form';
import { UserRoleDto } from './dtos/user-role.dto';
import { UpdateUserRoleForm } from './dtos/update-user-role.form';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { JwtPermissionsGuard } from '../security/guards/jwt-permissions.guard';
import { RequiredPermissions } from '../security/decorators/required-permissions.decorator';
import { UserRolePermissionsEnum } from '@prisma/client';
import { UserRoleQueryDto } from './dtos/user-role-query.dto';

@ApiTags('user-roles')
@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new user role' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: UserRoleDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.ManageUserRoles)
  public async create(@Body() body: CreateUserRoleForm) {
    const form = CreateUserRoleForm.from(body);
    const errors = await CreateUserRoleForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }
    const model = await this.userRolesService.create(form);

    return UserRoleDto.fromModel(model);
  }

  @Get()
  @ApiOperation({ summary: 'Find all user roles' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HttpStatus:200:OK',
    type: UserRoleDto,
    isArray: true,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.ManageUserRoles)
  public async findAll(@Query() query: UserRoleQueryDto) {
    const { models, remaining } = await this.userRolesService.findAll(query);

    return { data: UserRoleDto.fromModels(models), remaining };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find user role with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HttpStatus:200:OK',
    type: UserRoleDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.ManageUserRoles)
  public async findById(@Param('id') id: string) {
    const model = await this.userRolesService.findWithId(id);

    return UserRoleDto.fromModel(model);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user role with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HttpStatus:200:OK',
    type: UserRoleDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.ManageUserRoles)
  public async updateById(
    @Param('id') id: string,
    @Body() body: UpdateUserRoleForm,
  ) {
    const form = UpdateUserRoleForm.from(body);
    const errors = await UpdateUserRoleForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }
    const model = await this.userRolesService.updateWithId(id, form);

    return UserRoleDto.fromModel(model);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Activate user role with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HttpStatus:200:OK',
    type: UserRoleDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.ArchiveEverything)
  public async activateById(@Param('id') id: string) {
    const model = await this.userRolesService.activateWithId(id);

    return UserRoleDto.fromModel(model);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive user role with id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HttpStatus:200:OK',
    type: UserRoleDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.ArchiveEverything)
  public async archiveById(@Param('id') id: string) {
    const model = await this.userRolesService.archiveWithId(id);

    return UserRoleDto.fromModel(model);
  }
}
