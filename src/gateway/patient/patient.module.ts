import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CoreModule } from '../../core/core.module';
import { ReposModule } from '../../repos/repos.module';
import { PatientAuthController } from './controllers/patient-auth.controller';
import { PatientProfileController } from './controllers/patient-profile.controller';
import { PatientBookingController } from './controllers/patient-booking.controller';
import { PatientMedicalRecordController } from './controllers/patient-medical-record.controller';
import { PatientJwtStrategy } from './strategies/patient-jwt.strategy';

@Module({
  imports: [CoreModule, ReposModule, PassportModule.register({ defaultStrategy: 'patient-jwt' })],
  controllers: [
    PatientAuthController,
    PatientProfileController,
    PatientBookingController,
    PatientMedicalRecordController,
  ],
  providers: [PatientJwtStrategy],
})
export class PatientModule {}
