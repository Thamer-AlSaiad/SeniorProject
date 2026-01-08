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
import { AllergySeverity, AllergyType } from '../../common/types';
import { PatientEntity } from './patient.entity';

@Entity('allergies')
@Index(['organizationId', 'patientId'])
export class AllergyEntity {
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

  @Column({ type: 'enum', enum: AllergyType })
  allergyType: AllergyType;

  @Column({ length: 200 })
  allergen: string;

  @Column({ type: 'enum', enum: AllergySeverity })
  severity: AllergySeverity;

  @Column({ type: 'text', nullable: true })
  reaction: string;

  @Column({ type: 'date', nullable: true })
  onsetDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

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
