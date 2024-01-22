import {
  Controller,
  Post,
  Body,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignUpForm } from './dto/sign-up.form';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Sign up with email, name, user role and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    // type: UserRoleDto,
  })
  @Post('sign-up')
  public async signUp(@Body() body: SignUpForm) {
    const form = SignUpForm.from(body);
    const errors = await SignUpForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }
    const model = await this.authService.signUp(form);

    return model;
  }
}
