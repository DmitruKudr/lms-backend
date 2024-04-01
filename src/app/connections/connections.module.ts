import { Module } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { ConnectionsController } from './connections.controller';
import { PrismaService } from '../../prisma.service';
import { StudentsService } from '../students/students.service';
import { UsersService } from '../users/users.service';
import { UserRolesService } from '../user-roles/user-roles.service';
import { FilesService } from '../files/files.service';

@Module({
  controllers: [ConnectionsController],
  providers: [
    ConnectionsService,
    PrismaService,
    UsersService,
    UserRolesService,
    FilesService,
    StudentsService,
  ],
})
export class ConnectionsModule {}
