import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { AllergyEntity } from '../entities/allergy.entity';
import { PaginationParams, PaginatedResponse } from '../../common/types';

@Injectable()
export class AllergyRepository {
  constructor(
    @InjectRepository(AllergyEntity)
    private readonly repository: Repository<AllergyEntity>,
  ) {}

  async findById(id: string, organizationId: string): Promise<AllergyEntity | null> {
    return this.repository.findOne({
      where: { id, organizationId, deletedAt: IsNull() },
      relations: ['patient'],
    });
  }

  async findByPatient(
    patientId: string,
    organizationId: string,
    activeOnly = true,
  ): Promise<AllergyEntity[]> {
    const where: any = { patientId, organizationId, deletedAt: IsNull() };
    if (activeOnly) where.isActive = true;

    return this.repository.find({
      where,
      order: { severity: 'DESC', createdAt: 'DESC' },
    });
  }

  async findAll(
    organizationId: string,
    pagination: PaginationParams,
    patientId?: string,
  ): Promise<PaginatedResponse<AllergyEntity>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('allergy')
      .leftJoinAndSelect('allergy.patient', 'patient')
      .where('allergy.organizationId = :organizationId', { organizationId })
      .andWhere('allergy.deletedAt IS NULL');

    if (patientId) {
      queryBuilder.andWhere('allergy.patientId = :patientId', { patientId });
    }

    queryBuilder
      .orderBy(`allergy.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: Partial<AllergyEntity>): Promise<AllergyEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: string, organizationId: string, data: Partial<AllergyEntity>): Promise<AllergyEntity | null> {
    await this.repository.update(
      { id, organizationId, deletedAt: IsNull() },
      data,
    );
    return this.findById(id, organizationId);
  }

  async softDelete(id: string, organizationId: string, deletedBy: string): Promise<void> {
    await this.repository.update(
      { id, organizationId },
      { deletedAt: new Date(), updatedBy: deletedBy },
    );
  }

  async checkDuplicate(
    patientId: string,
    organizationId: string,
    allergen: string,
    excludeId?: string,
  ): Promise<boolean> {
    const queryBuilder = this.repository
      .createQueryBuilder('allergy')
      .where('allergy.patientId = :patientId', { patientId })
      .andWhere('allergy.organizationId = :organizationId', { organizationId })
      .andWhere('LOWER(allergy.allergen) = LOWER(:allergen)', { allergen })
      .andWhere('allergy.deletedAt IS NULL');

    if (excludeId) {
      queryBuilder.andWhere('allergy.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }
}
