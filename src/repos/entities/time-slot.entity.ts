import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { TimeSlotStatus } from '../../common/types';
import { ScheduleEntity } from './schedule.entity';
import { DoctorEntity } from './doctor.entity';
import { OrganizationEntity } from './organization.entity';

@Entity('time_slots')
@Index(['doctorId', 'date'])
@Index(['status'])
@Index(['organizationId'])
@Unique(['doctorId', 'date', 'startTime'])
export class TimeSlotEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  scheduleId: string;

  @ManyToOne(() => ScheduleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scheduleId' })
  schedule: ScheduleEntity;

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
  date: Date;

  @Column({ type: 'time' })
  startTime: string; // HH:mm format

  @Column({ type: 'time' })
  endTime: string; // HH:mm format

  @Column({ type: 'enum', enum: TimeSlotStatus, default: TimeSlotStatus.AVAILABLE })
  status: TimeSlotStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
