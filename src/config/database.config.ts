import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PatientEntity } from '../repos/entities/patient.entity';
import { DoctorEntity } from '../repos/entities/doctor.entity';
import { AdminEntity } from '../repos/entities/admin.entity';
import { VerificationTokenEntity } from '../repos/entities/verification-token.entity';
import { OrganizationEntity } from '../repos/entities/organization.entity';
import { EncounterEntity } from '../repos/entities/encounter.entity';
import { MedicalRecordEntity } from '../repos/entities/medical-record.entity';
import { AllergyEntity } from '../repos/entities/allergy.entity';
import { VitalSignEntity } from '../repos/entities/vital-sign.entity';
import { ReviewOfSystemsEntity } from '../repos/entities/review-of-systems.entity';
import { DocumentEntity } from '../repos/entities/document.entity';
import { PastMedicalProcedureEntity } from '../repos/entities/past-medical-procedure.entity';
// Sprint 3-4: Scheduling entities
import { ScheduleEntity } from '../repos/entities/schedule.entity';
import { TimeSlotEntity } from '../repos/entities/time-slot.entity';
import { AppointmentEntity } from '../repos/entities/appointment.entity';
import { ScheduleExceptionEntity } from '../repos/entities/schedule-exception.entity';
import { DoctorOrganizationEntity } from '../repos/entities/doctor-organization.entity';

export default (): TypeOrmModuleOptions => {
  if (!process.env.DB_HOST) throw new Error('DB_HOST is required');
  if (!process.env.DB_PORT) throw new Error('DB_PORT is required');
  if (!process.env.DB_USERNAME) throw new Error('DB_USERNAME is required');
  if (!process.env.DB_PASSWORD) throw new Error('DB_PASSWORD is required');
  if (!process.env.DB_NAME) throw new Error('DB_NAME is required');

  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
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
    ],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
};
