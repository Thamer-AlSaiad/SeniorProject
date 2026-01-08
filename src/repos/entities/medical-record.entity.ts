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
import { PatientEntity } from './patient.entity';
import { EncounterEntity } from './encounter.entity';
import { DoctorEntity } from './doctor.entity';

@Entity('medical_records')
@Index(['organizationId', 'patientId'])
@Index(['organizationId', 'encounterId'])
export class MedicalRecordEntity {
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

  @Column('uuid', { nullable: true })
  encounterId: string;

  @ManyToOne(() => EncounterEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'encounterId' })
  encounter: EncounterEntity;

  @Column('uuid')
  doctorId: string;

  @ManyToOne(() => DoctorEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: DoctorEntity;

  // Present Complaint
  @Column({ type: 'text', nullable: true })
  presentComplaint: string;

  // History of Presenting Complaint
  @Column({ type: 'text', nullable: true })
  historyOfPresentingComplaint: string;

  // Past Medical History
  @Column({ type: 'text', nullable: true })
  pastMedicalHistory: string;

  // Past Surgical History
  @Column({ type: 'text', nullable: true })
  pastSurgicalHistory: string;

  // Drug History
  @Column({ type: 'text', nullable: true })
  drugHistory: string;

  // Family History
  @Column({ type: 'text', nullable: true })
  familyHistory: string;

  // Social History
  @Column({ type: 'text', nullable: true })
  socialHistory: string;

  // Physical Examination
  @Column({ type: 'jsonb', nullable: true })
  physicalExamination: Record<string, any>;

  // Assessment/Diagnosis
  @Column({ type: 'text', nullable: true })
  assessment: string;

  // Plan
  @Column({ type: 'text', nullable: true })
  plan: string;

  // Additional Notes
  @Column({ type: 'text', nullable: true })
  additionalNotes: string;

  @Column({ default: false })
  isFinalized: boolean;

  @Column({ type: 'timestamp', nullable: true })
  finalizedAt: Date;

  @Column('uuid', { nullable: true })
  finalizedBy: string;

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
