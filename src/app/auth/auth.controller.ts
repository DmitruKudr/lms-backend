import {
  Controller,
  Post,
  Body,
  HttpStatus,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignUpForm } from './dtos/sign-up.form';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { SecurityService } from '../security/security.service';
import { JwtTokensDto } from '../security/dtos/jwt-tokens.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private securityService: SecurityService,
  ) {}

  @ApiOperation({ summary: 'Sign up with email, name, user role and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: JwtTokensDto,
  })
  @Post('sign-up')
  public async signUp(@Req() req: any, @Body() body: SignUpForm) {
    const form = SignUpForm.from(body);
    const errors = await SignUpForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }

    return await this.authService.signUp(form);
  }
}
