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
import { ReviewOfSystemsCategory } from '../../common/types';
import { PatientEntity } from './patient.entity';
import { EncounterEntity } from './encounter.entity';

@Entity('review_of_systems')
@Index(['organizationId', 'patientId'])
@Index(['organizationId', 'encounterId'])
export class ReviewOfSystemsEntity {
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

  @Column({ type: 'enum', enum: ReviewOfSystemsCategory })
  category: ReviewOfSystemsCategory;

  @Column({ default: false })
  isPositive: boolean;

  @Column({ type: 'text', nullable: true })
  findings: string;

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
