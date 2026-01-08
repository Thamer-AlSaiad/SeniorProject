import { Entity, Column } from 'typeorm';
import { BaseUserEntity } from './base.entity';

@Entity('doctors')
export class DoctorEntity extends BaseUserEntity {
  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 20, nullable: true })
  phoneNumber: string;

  @Column({ length: 100, nullable: true })
  specialization: string;

  @Column({ length: 50, nullable: true })
  licenseNumber: string;
}
