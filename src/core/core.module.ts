import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReposModule } from '../repos/repos.module';

// Auth Services
import { PatientAuthService } from './services/auth/patient-auth.service';
import { DoctorAuthService } from './services/auth/doctor-auth.service';
import { AdminAuthService } from './services/auth/admin-auth.service';

// Profile Services
import { PatientProfileService } from './services/profile/patient-profile.service';
import { DoctorProfileService } from './services/profile/doctor-profile.service';

// Email Service
import { EmailService } from './services/email/email.service';

// Clinical Services
import { EncounterService } from './services/clinical/encounter.service';
import { MedicalRecordService } from './services/clinical/medical-record.service';
import { AllergyService } from './services/clinical/allergy.service';
import { VitalSignService } from './services/clinical/vital-sign.service';
import { ReviewOfSystemsService } from './services/clinical/review-of-systems.service';
import { PastMedicalProcedureService } from './services/clinical/past-medical-procedure.service';

// Transcription Services
import { WhisperClientService } from './services/transcription/whisper-client.service';

// Scheduling Services
import { ScheduleService } from './services/scheduling/schedule.service';
import { TimeSlotService } from './services/scheduling/time-slot.service';
import { AppointmentService } from './services/scheduling/appointment.service';
import { ScheduleExceptionService } from './services/scheduling/schedule-exception.service';

// Admin Services
import { OrganizationService } from './services/admin/organization.service';
import { DoctorManagementService } from './services/admin/doctor-management.service';

// Patient Services
import { PatientMedicalRecordService } from './services/patient/patient-medical-record.service';

@Module({
  imports: [
    ReposModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: { expiresIn: config.get<string>('jwt.expiresIn') },
      }),
    }),
  ],
  providers: [
    // Auth
    EmailService,
    PatientAuthService,
    DoctorAuthService,
    AdminAuthService,
    // Profile
    PatientProfileService,
    DoctorProfileService,
    // Clinical
    EncounterService,
    MedicalRecordService,
    AllergyService,
    VitalSignService,
    ReviewOfSystemsService,
    PastMedicalProcedureService,
    // Transcription
    WhisperClientService,
    // Scheduling
    ScheduleService,
    TimeSlotService,
    AppointmentService,
    ScheduleExceptionService,
    // Admin
    OrganizationService,
    DoctorManagementService,
    // Patient
    PatientMedicalRecordService,
  ],
  exports: [
    // Auth
    PatientAuthService,
    DoctorAuthService,
    AdminAuthService,
    // Profile
    PatientProfileService,
    DoctorProfileService,
    // Clinical
    EncounterService,
    MedicalRecordService,
    AllergyService,
    VitalSignService,
    ReviewOfSystemsService,
    PastMedicalProcedureService,
    // Transcription
    WhisperClientService,
    // Scheduling
    ScheduleService,
    TimeSlotService,
    AppointmentService,
    ScheduleExceptionService,
    // Admin
    OrganizationService,
    DoctorManagementService,
    // Patient
    PatientMedicalRecordService,
  ],
})
export class CoreModule {}
