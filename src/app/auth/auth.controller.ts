import {
  Controller,
  Post,
  Body,
  HttpStatus,
  BadRequestException,
  Req,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignUpForm } from './dtos/sign-up.form';
import { ErrorCodesEnum } from '../../shared/enums/error-codes.enum';
import { JwtTokensDto } from '../security/dtos/jwt-tokens.dto';
import { JwtPermissionsGuard } from '../security/guards/jwt-permissions.guard';
import { RequiredPermissions } from '../../decorators/required-permissions.decorator';
import { UserRolePermissionsEnum } from '@prisma/client';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Sign up with email, name, user role and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:201:OK',
    type: JwtTokensDto,
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

    return await this.authService.signUp(form);
  }

  @ApiOperation({ summary: 'Test jwt permissions guard' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTPStatus:200:OK',
  })
  @Post('test-guard')
  @UseGuards(JwtPermissionsGuard)
  @RequiredPermissions(
    UserRolePermissionsEnum.GetTests,
    // UserRolePermissionsEnum.GetUsers,
  )
  public async testGuard(@Req() req: any) {
    return 'all cool';
  }
}
