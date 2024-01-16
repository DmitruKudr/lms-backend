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
import { UpdateUserRoleDto } from './dtos/update-user-role.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NewUserRoleForm } from './dtos/new-user-role.form';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { UserRoleDto } from './dtos/user-role.dto';

@ApiTags('user-roles')
@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new user role' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: UserRoleDto,
    isArray: false,
  })
  public async create(@Body() form: NewUserRoleForm) {
    const errors = await NewUserRoleForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }

    return await this.userRolesService.create(form);
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
    return await this.userRolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find user role by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HttpStatus:200:OK',
    type: UserRoleDto,
    isArray: false,
  })
  public async findById(@Param('id') id: string) {
    return await this.userRolesService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.userRolesService.update(+id, updateUserRoleDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userRolesService.delete(+id);
  }
}
