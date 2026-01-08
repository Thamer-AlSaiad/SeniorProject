import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { DoctorEntity } from './doctor.entity';
import { OrganizationEntity } from './organization.entity';

@Entity('doctor_organizations')
@Index(['doctorId'])
@Index(['organizationId'])
@Unique(['doctorId', 'organizationId'])
export class DoctorOrganizationEntity {
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

  @Column({ default: false })
  isPrimary: boolean;

  @CreateDateColumn()
  joinedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  leftAt: Date | null;
}
