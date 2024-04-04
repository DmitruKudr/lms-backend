import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../../prisma.service';
import { SecurityModule } from '../security/security.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [SecurityModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
