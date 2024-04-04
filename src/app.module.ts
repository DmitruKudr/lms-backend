import { Module } from '@nestjs/common';
import { UserRolesModule } from './app/user-roles/user-roles.module';
import { AuthModule } from './app/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './app/users/users.module';
import { StudentsModule } from './app/students/students.module';
import { ConnectionsModule } from './app/connections/connections.module';

@Module({
  imports: [
    // ===== config =====
    ConfigModule.forRoot({ isGlobal: true }),
    // ===== app =====
    UserRolesModule,
    AuthModule,
    UsersModule,
    ConnectionsModule,
    StudentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
