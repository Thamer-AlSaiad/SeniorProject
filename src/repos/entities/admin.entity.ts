import { Entity, Column } from 'typeorm';
import { BaseUserEntity } from './base.entity';

@Entity('admins')
export class AdminEntity extends BaseUserEntity {
  @Column({ length: 200 })
  name: string;
}
