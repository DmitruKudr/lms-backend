import {
  Controller,
  Post,
  Body,
  HttpStatus,
  BadRequestException,
  Patch,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignUpForm } from './dtos/sign-up.form';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { JwtTokensDto } from '../security/dtos/jwt-tokens.dto';
import { SignInForm } from './dtos/sign-in.form';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  @ApiOperation({ summary: 'Sign up with email, name, user role and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: JwtTokensDto,
  })
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

    return await this.authService.signUp(form);
  }

  @Put('sign-in')
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: JwtTokensDto,
  })
  public async signIn(@Body() body: SignInForm) {
    const form = SignInForm.from(body);
    const errors = await SignInForm.validate(form);
    if (errors) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors,
      });
    }

    return await this.authService.signIn(form);
  }

  @Patch('get-access-token')
  @ApiOperation({ summary: 'Get new access token using refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
    type: String,
  })
  public async getAccessToken(@Body() body: { refreshToken: string }) {
    const refreshToken = body.refreshToken;
    if (!body || !refreshToken) {
      throw new BadRequestException({
        statusCode: 400,
        message: ErrorCodesEnum.InvalidForm,
        errors: ['Must contain refresh token'],
      });
    }

    return await this.authService.getAccessToken(refreshToken);
  }
}
