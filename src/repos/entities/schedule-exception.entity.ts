import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DoctorEntity } from './doctor.entity';
import { OrganizationEntity } from './organization.entity';

@Entity('schedule_exceptions')
@Index(['doctorId'])
@Index(['organizationId'])
@Index(['exceptionDate'])
@Index(['doctorId', 'exceptionDate'])
export class ScheduleExceptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ type: 'date' })
  exceptionDate: Date;

  @Column({ type: 'time', nullable: true })
  startTime: string; // null = whole day blocked

  @Column({ type: 'time', nullable: true })
  endTime: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
