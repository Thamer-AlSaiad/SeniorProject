import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { MedicalRecordEntity } from '../entities/medical-record.entity';
import { PaginationParams, PaginatedResponse } from '../../common/types';

export interface MedicalRecordFilters {
  organizationId: string;
  patientId?: string;
  doctorId?: string;
  encounterId?: string;
  isFinalized?: boolean;
}

@Injectable()
export class MedicalRecordRepository {
  constructor(
    @InjectRepository(MedicalRecordEntity)
    private readonly repository: Repository<MedicalRecordEntity>,
  ) {}

  async findById(id: string, organizationId: string): Promise<MedicalRecordEntity | null> {
    return this.repository.findOne({
      where: { id, organizationId, deletedAt: IsNull() },
      relations: ['patient', 'doctor', 'encounter'],
    });
  }

  async findByEncounter(encounterId: string, organizationId: string): Promise<MedicalRecordEntity | null> {
    return this.repository.findOne({
      where: { encounterId, organizationId, deletedAt: IsNull() },
      relations: ['patient', 'doctor', 'encounter'],
    });
  }

  async findAll(
    filters: MedicalRecordFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<MedicalRecordEntity>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.patient', 'patient')
      .leftJoinAndSelect('record.doctor', 'doctor')
      .leftJoinAndSelect('record.encounter', 'encounter')
      .where('record.organizationId = :organizationId', { organizationId: filters.organizationId })
      .andWhere('record.deletedAt IS NULL');

    if (filters.patientId) {
      queryBuilder.andWhere('record.patientId = :patientId', { patientId: filters.patientId });
    }
    if (filters.doctorId) {
      queryBuilder.andWhere('record.doctorId = :doctorId', { doctorId: filters.doctorId });
    }
    if (filters.encounterId) {
      queryBuilder.andWhere('record.encounterId = :encounterId', { encounterId: filters.encounterId });
    }
    if (filters.isFinalized !== undefined) {
      queryBuilder.andWhere('record.isFinalized = :isFinalized', { isFinalized: filters.isFinalized });
    }

    queryBuilder
      .orderBy(`record.${sortBy}`, sortOrder)
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

  async create(data: Partial<MedicalRecordEntity>): Promise<MedicalRecordEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: string, organizationId: string, data: Partial<MedicalRecordEntity>): Promise<MedicalRecordEntity | null> {
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

  async finalize(id: string, organizationId: string, finalizedBy: string): Promise<MedicalRecordEntity | null> {
    await this.repository.update(
      { id, organizationId, deletedAt: IsNull() },
      { isFinalized: true, finalizedAt: new Date(), finalizedBy },
    );
    return this.findById(id, organizationId);
  }

  async findByPatient(patientId: string, organizationId: string): Promise<MedicalRecordEntity[]> {
    return this.repository.find({
      where: { patientId, organizationId, deletedAt: IsNull() },
      relations: ['doctor', 'encounter'],
      order: { createdAt: 'DESC' },
    });
  }
}
