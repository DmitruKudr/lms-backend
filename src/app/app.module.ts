import { Module } from '@nestjs/common';
import { UserRolesModule } from './user-roles/user-roles.module';

@Module({
  imports: [UserRolesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
