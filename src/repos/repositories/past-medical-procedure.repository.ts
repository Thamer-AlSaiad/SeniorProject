import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PastMedicalProcedureEntity } from '../entities/past-medical-procedure.entity';
import { PaginationParams, PaginatedResponse } from '../../common/types';

@Injectable()
export class PastMedicalProcedureRepository {
  constructor(
    @InjectRepository(PastMedicalProcedureEntity)
    private readonly repository: Repository<PastMedicalProcedureEntity>,
  ) {}

  async findById(id: string, organizationId: string): Promise<PastMedicalProcedureEntity | null> {
    return this.repository.findOne({
      where: { id, organizationId, deletedAt: IsNull() },
      relations: ['patient'],
    });
  }

  async findByPatient(patientId: string, organizationId: string): Promise<PastMedicalProcedureEntity[]> {
    return this.repository.find({
      where: { patientId, organizationId, deletedAt: IsNull() },
      order: { procedureDate: 'DESC' },
    });
  }

  async findAll(
    organizationId: string,
    pagination: PaginationParams,
    patientId?: string,
  ): Promise<PaginatedResponse<PastMedicalProcedureEntity>> {
    const { page = 1, limit = 20, sortBy = 'procedureDate', sortOrder = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('procedure')
      .leftJoinAndSelect('procedure.patient', 'patient')
      .where('procedure.organizationId = :organizationId', { organizationId })
      .andWhere('procedure.deletedAt IS NULL');

    if (patientId) {
      queryBuilder.andWhere('procedure.patientId = :patientId', { patientId });
    }

    queryBuilder
      .orderBy(`procedure.${sortBy}`, sortOrder)
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

  async create(data: Partial<PastMedicalProcedureEntity>): Promise<PastMedicalProcedureEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: string, organizationId: string, data: Partial<PastMedicalProcedureEntity>): Promise<PastMedicalProcedureEntity | null> {
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
}
