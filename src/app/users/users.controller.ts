import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  UseGuards,
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

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('default-user')
  @ApiOperation({ summary: 'Create new default user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: UserDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.CreateUsers)
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

    return UserDto.fromModel(model, form.password);
  }

  @Post('special-user')
  @ApiOperation({ summary: 'Create new special user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: UserDto,
  })
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(UserRolePermissionsEnum.CreateAdmins)
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

    return UserDto.fromModel(model, form.password);
  }
}
