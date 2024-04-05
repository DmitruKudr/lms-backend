import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { PrismaService } from '../../prisma.service';
import { UsersService } from '../users/users.service';
import { UserRolesService } from '../user-roles/user-roles.service';
import { FilesService } from '../files/files.service';

@Module({
  controllers: [TeachersController],
  providers: [
    TeachersService,
    PrismaService,
    UsersService,
    UserRolesService,
    FilesService,
  ],
})
export class TeachersModule {}
