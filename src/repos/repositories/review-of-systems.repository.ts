import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ReviewOfSystemsEntity } from '../entities/review-of-systems.entity';
import { ReviewOfSystemsCategory } from '../../common/types';

@Injectable()
export class ReviewOfSystemsRepository {
  constructor(
    @InjectRepository(ReviewOfSystemsEntity)
    private readonly repository: Repository<ReviewOfSystemsEntity>,
  ) {}

  async findById(id: string, organizationId: string): Promise<ReviewOfSystemsEntity | null> {
    return this.repository.findOne({
      where: { id, organizationId, deletedAt: IsNull() },
      relations: ['patient', 'encounter'],
    });
  }

  async findByPatient(patientId: string, organizationId: string): Promise<ReviewOfSystemsEntity[]> {
    return this.repository.find({
      where: { patientId, organizationId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findByEncounter(encounterId: string, organizationId: string): Promise<ReviewOfSystemsEntity[]> {
    return this.repository.find({
      where: { encounterId, organizationId, deletedAt: IsNull() },
      order: { category: 'ASC' },
    });
  }

  async findByCategory(
    patientId: string,
    organizationId: string,
    category: ReviewOfSystemsCategory,
  ): Promise<ReviewOfSystemsEntity[]> {
    return this.repository.find({
      where: { patientId, organizationId, category, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: Partial<ReviewOfSystemsEntity>): Promise<ReviewOfSystemsEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async createMany(data: Partial<ReviewOfSystemsEntity>[]): Promise<ReviewOfSystemsEntity[]> {
    const entities = this.repository.create(data);
    return this.repository.save(entities);
  }

  async update(id: string, organizationId: string, data: Partial<ReviewOfSystemsEntity>): Promise<ReviewOfSystemsEntity | null> {
    await this.repository.update(
      { id, organizationId, deletedAt: IsNull() },
      data,
    );
    return this.findById(id, organizationId);
  }

  async softDelete(id: string, organizationId: string): Promise<void> {
    await this.repository.update(
      { id, organizationId },
      { deletedAt: new Date() },
    );
  }

  async deleteByEncounter(encounterId: string, organizationId: string): Promise<void> {
    await this.repository.update(
      { encounterId, organizationId },
      { deletedAt: new Date() },
    );
  }
}
