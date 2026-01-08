import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CoreModule } from '../../core/core.module';
import { ReposModule } from '../../repos/repos.module';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { OrganizationController } from './controllers/organization.controller';
import { DoctorManagementController } from './controllers/doctor-management.controller';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';

@Module({
  imports: [CoreModule, ReposModule, PassportModule.register({ defaultStrategy: 'admin-jwt' })],
  controllers: [AdminAuthController, OrganizationController, DoctorManagementController],
  providers: [AdminJwtStrategy],
})
export class AdminModule {}
