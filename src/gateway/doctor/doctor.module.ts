import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { memoryStorage } from 'multer';
import { CoreModule } from '../../core/core.module';
import { ReposModule } from '../../repos/repos.module';
import { PatientEntity } from '../../repos/entities/patient.entity';

// Controllers
import { DoctorAuthController } from './controllers/doctor-auth.controller';
import { DoctorProfileController } from './controllers/doctor-profile.controller';
import { EncounterController } from './controllers/encounter.controller';
import { MedicalRecordController } from './controllers/medical-record.controller';
import { AllergyController } from './controllers/allergy.controller';
import { VitalSignController } from './controllers/vital-sign.controller';
import { ReviewOfSystemsController } from './controllers/review-of-systems.controller';
import { PastMedicalProcedureController } from './controllers/past-medical-procedure.controller';
import { PatientController } from './controllers/patient.controller';
import { ScheduleController } from './controllers/schedule.controller';
import { ScheduleExceptionController } from './controllers/schedule-exception.controller';
import { DoctorAppointmentController } from './controllers/doctor-appointment.controller';

// Gateways (WebSocket)
import { TranscriptionGateway } from './gateways/transcription.gateway';

// Strategy
import { DoctorJwtStrategy } from './strategies/doctor-jwt.strategy';

@Module({
  imports: [
    CoreModule,
    ReposModule,
    TypeOrmModule.forFeature([PatientEntity]),
    PassportModule.register({ defaultStrategy: 'doctor-jwt' }),
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 25 * 1024 * 1024, // 25MB max file size
      },
    }),
  ],
  controllers: [
    DoctorAuthController,
    DoctorProfileController,
    EncounterController,
    MedicalRecordController,
    AllergyController,
    VitalSignController,
    ReviewOfSystemsController,
    PastMedicalProcedureController,
    PatientController,
    ScheduleController,
    ScheduleExceptionController,
    DoctorAppointmentController,
  ],
  providers: [
    DoctorJwtStrategy,
    TranscriptionGateway,
  ],
})
export class DoctorModule {}
