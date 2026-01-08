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

@Entity('past_medical_procedures')
@Index(['organizationId', 'patientId'])
export class PastMedicalProcedureEntity {
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

  @Column({ length: 255 })
  procedureName: string;

  @Column({ length: 100, nullable: true })
  procedureCode: string; // ICD-10 or CPT code

  @Column({ type: 'date', nullable: true })
  procedureDate: Date;

  @Column({ length: 255, nullable: true })
  performedBy: string;

  @Column({ length: 255, nullable: true })
  facility: string;

  @Column({ type: 'text', nullable: true })
  indication: string;

  @Column({ type: 'text', nullable: true })
  outcome: string;

  @Column({ type: 'text', nullable: true })
  complications: string;

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
