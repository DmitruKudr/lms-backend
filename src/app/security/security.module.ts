import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [],
  providers: [SecurityService, PrismaService, JwtService],
})
export class SecurityModule {}
