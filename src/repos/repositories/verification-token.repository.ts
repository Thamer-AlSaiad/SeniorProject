import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationTokenEntity } from '../entities/verification-token.entity';
import { TokenType, UserType } from '../../common/types';

@Injectable()
export class VerificationTokenRepository {
  constructor(
    @InjectRepository(VerificationTokenEntity)
    private readonly repository: Repository<VerificationTokenEntity>,
  ) {}

  async create(data: Partial<VerificationTokenEntity>): Promise<VerificationTokenEntity> {
    const token = this.repository.create(data);
    return this.repository.save(token);
  }

  async findValidToken(token: string, type: TokenType): Promise<VerificationTokenEntity | null> {
    return this.repository.findOne({
      where: { token, type, isUsed: false },
    });
  }

  async markAsUsed(id: string): Promise<void> {
    await this.repository.update(id, { isUsed: true });
  }

  async deleteByUser(userId: string, type: TokenType, userType: UserType): Promise<void> {
    await this.repository.delete({ userId, type, userType });
  }
}
