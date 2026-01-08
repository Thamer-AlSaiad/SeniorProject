import { Entity, Column } from 'typeorm';
import { Gender } from '../../common/types';
import { BaseUserEntity } from './base.entity';

@Entity('patients')
export class PatientEntity extends BaseUserEntity {
  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'text', nullable: true })
  address: string;
}
