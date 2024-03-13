import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../prisma.service';
import { UserRolesService } from '../user-roles/user-roles.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, UserRolesService],
})
export class UsersModule {}
