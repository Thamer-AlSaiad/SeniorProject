import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { DoctorEntity } from './doctor.entity';
import { OrganizationEntity } from './organization.entity';

@Entity('schedules')
@Index(['doctorId'])
@Index(['organizationId'])
@Index(['doctorId', 'dayOfWeek'])
@Check('"start_time" < "end_time"')
@Check('"day_of_week" >= 0 AND "day_of_week" <= 6')
export class ScheduleEntity {
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

  @Column({ type: 'int', name: 'day_of_week' })
  dayOfWeek: number; // 0-6 (Sunday-Saturday)

  @Column({ type: 'time', name: 'start_time' })
  startTime: string; // HH:mm format

  @Column({ type: 'time', name: 'end_time' })
  endTime: string; // HH:mm format

  @Column({ type: 'int', default: 30 })
  slotDurationMinutes: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'date' })
  effectiveFrom: Date;

  @Column({ type: 'date', nullable: true })
  effectiveUntil: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
