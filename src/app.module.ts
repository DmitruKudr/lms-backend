import { Module } from '@nestjs/common';
import { UserRolesModule } from './app/user-roles/user-roles.module';
import { AuthModule } from './app/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './app/users/users.module';

@Module({
  imports: [
    // ===== config =====
    ConfigModule.forRoot({ isGlobal: true }),
    // ===== app =====
    UserRolesModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
