import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientEntity } from './entities/patient.entity';
import { DoctorEntity } from './entities/doctor.entity';
import { AdminEntity } from './entities/admin.entity';
import { VerificationTokenEntity } from './entities/verification-token.entity';
import { OrganizationEntity } from './entities/organization.entity';
import { EncounterEntity } from './entities/encounter.entity';
import { MedicalRecordEntity } from './entities/medical-record.entity';
import { AllergyEntity } from './entities/allergy.entity';
import { VitalSignEntity } from './entities/vital-sign.entity';
import { ReviewOfSystemsEntity } from './entities/review-of-systems.entity';
import { DocumentEntity } from './entities/document.entity';
import { PastMedicalProcedureEntity } from './entities/past-medical-procedure.entity';
// Sprint 3-4: Scheduling entities
import { ScheduleEntity } from './entities/schedule.entity';
import { TimeSlotEntity } from './entities/time-slot.entity';
import { AppointmentEntity } from './entities/appointment.entity';
import { ScheduleExceptionEntity } from './entities/schedule-exception.entity';
import { DoctorOrganizationEntity } from './entities/doctor-organization.entity';

import { PatientRepository } from './repositories/patient.repository';
import { DoctorRepository } from './repositories/doctor.repository';
import { AdminRepository } from './repositories/admin.repository';
import { VerificationTokenRepository } from './repositories/verification-token.repository';
import { EncounterRepository } from './repositories/encounter.repository';
import { MedicalRecordRepository } from './repositories/medical-record.repository';
import { AllergyRepository } from './repositories/allergy.repository';
import { VitalSignRepository } from './repositories/vital-sign.repository';
import { ReviewOfSystemsRepository } from './repositories/review-of-systems.repository';
import { DocumentRepository } from './repositories/document.repository';
import { PastMedicalProcedureRepository } from './repositories/past-medical-procedure.repository';
// Sprint 3-4: Scheduling repositories
import { ScheduleRepository } from './repositories/schedule.repository';
import { TimeSlotRepository } from './repositories/time-slot.repository';
import { AppointmentRepository } from './repositories/appointment.repository';
import { ScheduleExceptionRepository } from './repositories/schedule-exception.repository';
import { DoctorOrganizationRepository } from './repositories/doctor-organization.repository';
import { OrganizationRepository } from './repositories/organization.repository';

const entities = [
  PatientEntity,
  DoctorEntity,
  AdminEntity,
  VerificationTokenEntity,
  OrganizationEntity,
  EncounterEntity,
  MedicalRecordEntity,
  AllergyEntity,
  VitalSignEntity,
  ReviewOfSystemsEntity,
  DocumentEntity,
  PastMedicalProcedureEntity,
  // Sprint 3-4: Scheduling entities
  ScheduleEntity,
  TimeSlotEntity,
  AppointmentEntity,
  ScheduleExceptionEntity,
  DoctorOrganizationEntity,
];

const repositories = [
  PatientRepository,
  DoctorRepository,
  AdminRepository,
  VerificationTokenRepository,
  EncounterRepository,
  MedicalRecordRepository,
  AllergyRepository,
  VitalSignRepository,
  ReviewOfSystemsRepository,
  DocumentRepository,
  PastMedicalProcedureRepository,
  // Sprint 3-4: Scheduling repositories
  ScheduleRepository,
  TimeSlotRepository,
  AppointmentRepository,
  ScheduleExceptionRepository,
  DoctorOrganizationRepository,
  OrganizationRepository,
];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: repositories,
  exports: repositories,
})
export class ReposModule {}
