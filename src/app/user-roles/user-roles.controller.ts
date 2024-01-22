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
} from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { NewUserRoleForm } from './dtos/new-user-role.form';
import { UserRoleDto } from './dtos/user-role.dto';
import { UpdateUserRoleForm } from './dtos/update-user-role.form';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';

@ApiTags('user-roles')
@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @ApiOperation({ summary: 'Create new user role' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: UserRoleDto,
  })
  @Post()
  public async create(@Body() body: NewUserRoleForm) {
    const form = NewUserRoleForm.from(body);
    const errors = await NewUserRoleForm.validate(form);
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
  public async findAll() {
    const models = await this.userRolesService.findAll();

    return UserRoleDto.fromModels(models);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find user role by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HttpStatus:200:OK',
    type: UserRoleDto,
  })
  public async findById(@Param('id') id: string) {
    return await this.userRolesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user role by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HttpStatus:200:OK',
    type: UserRoleDto,
  })
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
    const model = await this.userRolesService.updateById(id, form);

    return UserRoleDto.fromModel(model);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user role by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HttpStatus:200:OK',
    type: UserRoleDto,
  })
  deleteById(@Param('id') id: string) {
    return this.userRolesService.deleteById(id);
  }

  @Patch('activate/:id')
  @ApiOperation({ summary: 'Activate user role by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HttpStatus:200:OK',
    type: UserRoleDto,
  })
  activateById(@Param('id') id: string) {
    return this.userRolesService.activateById(id);
  }

  @Delete('archive/:id')
  @ApiOperation({ summary: 'Archive user role by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HttpStatus:200:OK',
    type: UserRoleDto,
  })
  archiveById(@Param('id') id: string) {
    return this.userRolesService.archiveById(id);
  }
}
