import { Module } from '@nestjs/common';
import { UserRolesModule } from './app/user-roles/user-roles.module';

@Module({
  imports: [UserRolesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
