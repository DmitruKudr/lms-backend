import { Module } from '@nestjs/common';
import { TestsService } from './tests.service';
import { TestsController } from './tests.controller';
import { PrismaService } from '../../prisma.service';
import { UsersModule } from '../users/users.module';
import { SubjectsService } from '../subjects/subjects.service';
import { FilesService } from '../files/files.service';

@Module({
  imports: [UsersModule],
  controllers: [TestsController],
  providers: [TestsService, PrismaService, FilesService, SubjectsService],
})
export class TestsModule {}
