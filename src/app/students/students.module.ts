import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PrismaService } from '../../prisma.service';
import { UserRolesService } from '../user-roles/user-roles.service';
import { UsersService } from '../users/users.service';
import { FilesService } from '../files/files.service';

@Module({
  controllers: [StudentsController],
  providers: [
    StudentsService,
    PrismaService,
    UsersService,
    UserRolesService,
    FilesService,
  ],
})
export class StudentsModule {}
