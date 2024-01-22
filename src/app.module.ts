import { Module } from '@nestjs/common';
import { UserRolesModule } from './app/user-roles/user-roles.module';
import { AuthModule } from './app/auth/auth.module';

@Module({
  imports: [UserRolesModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
