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

@ApiTags('user-roles')
@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @ApiOperation({ summary: 'Create new user role' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
  })
  @Post()
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

  @ApiOperation({ summary: 'Find all user roles' })
  @Get()
  public async findAll() {
    return await this.userRolesService.findAll();
  }

  @ApiOperation({ summary: 'Find user role by id' })
  @Get(':id')
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
