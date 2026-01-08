import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, IsNull } from 'typeorm';
import { EncounterEntity } from '../entities/encounter.entity';
import { EncounterStatus } from '../../common/types';
import { PaginationParams, PaginatedResponse } from '../../common/types';

export interface EncounterFilters {
  organizationId: string;
  patientId?: string;
  doctorId?: string;
  status?: EncounterStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

@Injectable()
export class EncounterRepository {
  constructor(
    @InjectRepository(EncounterEntity)
    private readonly repository: Repository<EncounterEntity>,
  ) {}

  async findById(id: string, organizationId: string): Promise<EncounterEntity | null> {
    return this.repository.findOne({
      where: { id, organizationId, deletedAt: IsNull() },
      relations: ['patient', 'doctor'],
    });
  }

  async findByIdempotencyKey(key: string, organizationId: string): Promise<EncounterEntity | null> {
    return this.repository.findOne({
      where: { idempotencyKey: key, organizationId, deletedAt: IsNull() },
    });
  }

  async findAll(
    filters: EncounterFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<EncounterEntity>> {
    const { page = 1, limit = 20, sortBy = 'encounterDate', sortOrder = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<EncounterEntity> = {
      organizationId: filters.organizationId,
      deletedAt: IsNull(),
    };

    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.doctorId) where.doctorId = filters.doctorId;
    if (filters.status) where.status = filters.status;

    const queryBuilder = this.repository
      .createQueryBuilder('encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .leftJoinAndSelect('encounter.doctor', 'doctor')
      .where('encounter.organizationId = :organizationId', { organizationId: filters.organizationId })
      .andWhere('encounter.deletedAt IS NULL');

    if (filters.patientId) {
      queryBuilder.andWhere('encounter.patientId = :patientId', { patientId: filters.patientId });
    }
    if (filters.doctorId) {
      queryBuilder.andWhere('encounter.doctorId = :doctorId', { doctorId: filters.doctorId });
    }
    if (filters.status) {
      queryBuilder.andWhere('encounter.status = :status', { status: filters.status });
    }
    if (filters.startDate) {
      queryBuilder.andWhere('encounter.encounterDate >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      queryBuilder.andWhere('encounter.encounterDate <= :endDate', { endDate: filters.endDate });
    }
    
    // Search by patient name or reason for visit
    if (filters.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(patient.firstName) LIKE :search OR LOWER(patient.lastName) LIKE :search OR LOWER(encounter.reasonForVisit) LIKE :search OR LOWER(encounter.chiefComplaint) LIKE :search)',
        { search: searchTerm }
      );
    }

    queryBuilder
      .orderBy(`encounter.${sortBy}`, sortOrder)
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

  async create(data: Partial<EncounterEntity>): Promise<EncounterEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: string, organizationId: string, data: Partial<EncounterEntity>): Promise<EncounterEntity | null> {
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

  async findByPatient(patientId: string, organizationId: string): Promise<EncounterEntity[]> {
    return this.repository.find({
      where: { patientId, organizationId, deletedAt: IsNull() },
      relations: ['doctor'],
      order: { encounterDate: 'DESC' },
    });
  }

  async findActiveByDoctor(doctorId: string, organizationId: string): Promise<EncounterEntity[]> {
    return this.repository.find({
      where: {
        doctorId,
        organizationId,
        status: EncounterStatus.IN_PROGRESS,
        deletedAt: IsNull(),
      },
      relations: ['patient'],
      order: { encounterDate: 'DESC' },
    });
  }
}
