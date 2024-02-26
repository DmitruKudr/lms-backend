import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import { JwtStrategyService } from './jwt-strategy.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt-strategy' })],
  controllers: [],
  providers: [JwtStrategyService, SecurityService, JwtService, PrismaService],
  exports: [SecurityService],
})
export class SecurityModule {}
