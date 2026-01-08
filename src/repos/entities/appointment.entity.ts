import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AppointmentStatus } from '../../common/types';
import { PatientEntity } from './patient.entity';
import { DoctorEntity } from './doctor.entity';
import { OrganizationEntity } from './organization.entity';
import { TimeSlotEntity } from './time-slot.entity';
import { EncounterEntity } from './encounter.entity';

@Entity('appointments')
@Index(['patientId'])
@Index(['doctorId'])
@Index(['organizationId'])
@Index(['appointmentDate'])
@Index(['status'])
@Index(['doctorId', 'appointmentDate'])
export class AppointmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  patientId: string;

  @ManyToOne(() => PatientEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: PatientEntity;

  @Column('uuid')
  doctorId: string;

  @ManyToOne(() => DoctorEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: DoctorEntity;

  @Column('uuid')
  organizationId: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @Column('uuid')
  timeSlotId: string;

  @ManyToOne(() => TimeSlotEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'timeSlotId' })
  timeSlot: TimeSlotEntity;

  @Column('uuid', { nullable: true })
  encounterId: string;

  @ManyToOne(() => EncounterEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'encounterId' })
  encounter: EncounterEntity;

  @Column({ type: 'date' })
  appointmentDate: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  reasonForVisit: string;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column('uuid', { nullable: true })
  cancelledBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
