import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { TokenType, UserType } from '../../common/types';

@Entity('verification_tokens')
export class VerificationTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column({ type: 'enum', enum: UserType })
  @Index()
  userType: UserType;

  @Column({ unique: true })
  @Index()
  token: string;

  @Column({ type: 'enum', enum: TokenType })
  @Index()
  type: TokenType;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  isUsed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
