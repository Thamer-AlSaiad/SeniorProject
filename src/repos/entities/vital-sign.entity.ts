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
import { VitalSignType } from '../../common/types';
import { PatientEntity } from './patient.entity';
import { EncounterEntity } from './encounter.entity';

@Entity('vital_signs')
@Index(['organizationId', 'patientId'])
@Index(['organizationId', 'encounterId'])
export class VitalSignEntity {
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

  @Column({ type: 'enum', enum: VitalSignType })
  type: VitalSignType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  secondaryValue: number; // For blood pressure (diastolic)

  @Column({ length: 20 })
  unit: string;

  @Column({ type: 'timestamp' })
  recordedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column('uuid', { nullable: true })
  recordedBy: string;
}
