import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, ILike } from 'typeorm';
import { OrganizationEntity } from '../entities/organization.entity';
import { PaginationParams, PaginatedResponse } from '../../common/types';

export interface OrganizationFilters {
  search?: string;
  isActive?: boolean;
}

@Injectable()
export class OrganizationRepository {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly repository: Repository<OrganizationEntity>,
  ) {}

  async create(data: Partial<OrganizationEntity>): Promise<OrganizationEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<OrganizationEntity | null> {
    return this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findByCode(code: string): Promise<OrganizationEntity | null> {
    return this.repository.findOne({
      where: { code, deletedAt: IsNull() },
    });
  }

  async findAll(
    pagination: PaginationParams,
    filters?: OrganizationFilters,
  ): Promise<PaginatedResponse<OrganizationEntity>> {
    const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'ASC' } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('organization')
      .where('organization.deletedAt IS NULL');

    if (filters?.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(organization.name) LIKE :search OR LOWER(organization.code) LIKE :search)',
        { search: searchTerm },
      );
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('organization.isActive = :isActive', { isActive: filters.isActive });
    }

    queryBuilder
      .orderBy(`organization.${sortBy}`, sortOrder)
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

  async findActive(): Promise<OrganizationEntity[]> {
    return this.repository.find({
      where: { isActive: true, deletedAt: IsNull() },
      order: { name: 'ASC' },
    });
  }

  async update(id: string, data: Partial<OrganizationEntity>): Promise<OrganizationEntity | null> {
    await this.repository.update({ id, deletedAt: IsNull() }, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.update({ id }, { deletedAt: new Date() });
  }

  async setActive(id: string, isActive: boolean): Promise<OrganizationEntity | null> {
    await this.repository.update({ id, deletedAt: IsNull() }, { isActive });
    return this.findById(id);
  }

  async existsByCode(code: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.repository
      .createQueryBuilder('organization')
      .where('organization.code = :code', { code })
      .andWhere('organization.deletedAt IS NULL');

    if (excludeId) {
      queryBuilder.andWhere('organization.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  async count(filters?: OrganizationFilters): Promise<number> {
    const queryBuilder = this.repository
      .createQueryBuilder('organization')
      .where('organization.deletedAt IS NULL');

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('organization.isActive = :isActive', { isActive: filters.isActive });
    }

    return queryBuilder.getCount();
  }
}
