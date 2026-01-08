import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BaseRepository } from '../../../repos/repositories/base.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export abstract class BaseProfileService<T extends { id: string; passwordHash: string }> {
  constructor(protected readonly repository: BaseRepository<T>) {}

  async getProfile(id: string): Promise<T> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(id: string, data: Partial<T>): Promise<T> {
    const user = await this.repository.update(id, data);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.getProfile(id);

    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new BadRequestException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.repository.updatePassword(id, passwordHash);
  }

  async deleteAccount(id: string): Promise<void> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.repository.delete(id);
  }
}
