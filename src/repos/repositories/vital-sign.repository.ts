import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { VitalSignEntity } from '../entities/vital-sign.entity';
import { VitalSignType, PaginationParams, PaginatedResponse } from '../../common/types';

@Injectable()
export class VitalSignRepository {
  constructor(
    @InjectRepository(VitalSignEntity)
    private readonly repository: Repository<VitalSignEntity>,
  ) {}

  async findById(id: string, organizationId: string): Promise<VitalSignEntity | null> {
    return this.repository.findOne({
      where: { id, organizationId, deletedAt: IsNull() },
      relations: ['patient', 'encounter'],
    });
  }

  async findByPatient(patientId: string, organizationId: string): Promise<VitalSignEntity[]> {
    return this.repository.find({
      where: { patientId, organizationId, deletedAt: IsNull() },
      order: { recordedAt: 'DESC' },
    });
  }

  async findByEncounter(encounterId: string, organizationId: string): Promise<VitalSignEntity[]> {
    return this.repository.find({
      where: { encounterId, organizationId, deletedAt: IsNull() },
      order: { recordedAt: 'DESC' },
    });
  }

  async findLatestByType(
    patientId: string,
    organizationId: string,
    type: VitalSignType,
  ): Promise<VitalSignEntity | null> {
    return this.repository.findOne({
      where: { patientId, organizationId, type, deletedAt: IsNull() },
      order: { recordedAt: 'DESC' },
    });
  }

  async findAll(
    organizationId: string,
    pagination: PaginationParams,
    patientId?: string,
    encounterId?: string,
  ): Promise<PaginatedResponse<VitalSignEntity>> {
    const { page = 1, limit = 20, sortBy = 'recordedAt', sortOrder = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('vital')
      .leftJoinAndSelect('vital.patient', 'patient')
      .leftJoinAndSelect('vital.encounter', 'encounter')
      .where('vital.organizationId = :organizationId', { organizationId })
      .andWhere('vital.deletedAt IS NULL');

    if (patientId) {
      queryBuilder.andWhere('vital.patientId = :patientId', { patientId });
    }
    if (encounterId) {
      queryBuilder.andWhere('vital.encounterId = :encounterId', { encounterId });
    }

    queryBuilder
      .orderBy(`vital.${sortBy}`, sortOrder)
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

  async create(data: Partial<VitalSignEntity>): Promise<VitalSignEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async createMany(data: Partial<VitalSignEntity>[]): Promise<VitalSignEntity[]> {
    const entities = this.repository.create(data);
    return this.repository.save(entities);
  }

  async update(id: string, organizationId: string, data: Partial<VitalSignEntity>): Promise<VitalSignEntity | null> {
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
}
