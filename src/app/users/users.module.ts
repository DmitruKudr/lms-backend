import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../prisma.service';
import { UserRolesService } from '../user-roles/user-roles.service';
import { FilesService } from '../files/files.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, UserRolesService, FilesService],
  exports: [UsersService, FilesService],
})
export class UsersModule {}
