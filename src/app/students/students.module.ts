import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PrismaService } from '../../prisma.service';
import { UserRolesService } from '../user-roles/user-roles.service';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, PrismaService, UsersService, UserRolesService],
})
export class StudentsModule {}
