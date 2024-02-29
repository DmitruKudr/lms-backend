import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../../prisma.service';
import { SecurityModule } from '../security/security.module';
import { UsersService } from '../users/users.service';
import { UserRolesService } from '../user-roles/user-roles.service';

@Module({
  imports: [SecurityModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, UsersService, UserRolesService],
})
export class AuthModule {}
