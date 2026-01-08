import { Repository, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { AccountStatus } from '../../common/types';

export abstract class BaseRepository<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.repository.findOne({ where: { id } as unknown as FindOptionsWhere<T> });
  }

  async findByEmail(email: string): Promise<T | null> {
    return this.repository.findOne({ where: { email } as unknown as FindOptionsWhere<T> });
  }

  async create(data: Partial<T>): Promise<T> {
    const entity = this.repository.create(data as any);
    const saved = await this.repository.save(entity);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    await this.repository.update({ id } as unknown as FindOptionsWhere<T>, data as any);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id } as unknown as FindOptionsWhere<T>);
  }

  async exists(email: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { email } as unknown as FindOptionsWhere<T>,
    });
    return count > 0;
  }

  async verifyEmail(id: string): Promise<void> {
    await this.repository.update(
      { id } as unknown as FindOptionsWhere<T>,
      {
        isEmailVerified: true,
        accountStatus: AccountStatus.ACTIVE,
      } as any,
    );
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.repository.update(
      { id } as unknown as FindOptionsWhere<T>,
      {
        lastLoginAt: new Date(),
      } as any,
    );
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.repository.update(
      { id } as unknown as FindOptionsWhere<T>,
      {
        passwordHash,
      } as any,
    );
  }
}
