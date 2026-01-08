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
import { DocumentType } from '../../common/types';
import { PatientEntity } from './patient.entity';
import { EncounterEntity } from './encounter.entity';

@Entity('documents')
@Index(['organizationId', 'patientId'])
@Index(['organizationId', 'encounterId'])
export class DocumentEntity {
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

  @Column({ type: 'enum', enum: DocumentType })
  documentType: DocumentType;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500 })
  filePath: string;

  @Column({ length: 100 })
  mimeType: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({ length: 255, nullable: true })
  originalFileName: string;

  @Column({ type: 'date', nullable: true })
  documentDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column('uuid', { nullable: true })
  uploadedBy: string;
}
