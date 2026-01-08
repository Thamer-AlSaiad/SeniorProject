import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { EncounterStatus, EncounterType } from '../../common/types';
import { PatientEntity } from './patient.entity';
import { DoctorEntity } from './doctor.entity';

@Entity('encounters')
@Index(['organizationId', 'patientId'])
@Index(['organizationId', 'doctorId'])
@Index(['organizationId', 'status'])
@Index(['encounterDate'])
export class EncounterEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

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

  @Column({ type: 'enum', enum: EncounterType, default: EncounterType.CONSULTATION })
  encounterType: EncounterType;

  @Column({ type: 'enum', enum: EncounterStatus, default: EncounterStatus.PLANNED })
  status: EncounterStatus;

  @Column({ type: 'timestamp' })
  encounterDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'text', nullable: true })
  reasonForVisit: string;

  @Column({ type: 'text', nullable: true })
  chiefComplaint: string;

  @Column({ length: 100, nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true, unique: true })
  idempotencyKey: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column('uuid', { nullable: true })
  createdBy: string;

  @Column('uuid', { nullable: true })
  updatedBy: string;
}
