import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { DocumentEntity } from '../entities/document.entity';
import { DocumentType, PaginationParams, PaginatedResponse } from '../../common/types';

@Injectable()
export class DocumentRepository {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly repository: Repository<DocumentEntity>,
  ) {}

  async findById(id: string, organizationId: string): Promise<DocumentEntity | null> {
    return this.repository.findOne({
      where: { id, organizationId, deletedAt: IsNull() },
      relations: ['patient', 'encounter'],
    });
  }

  async findByPatient(patientId: string, organizationId: string): Promise<DocumentEntity[]> {
    return this.repository.find({
      where: { patientId, organizationId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findByEncounter(encounterId: string, organizationId: string): Promise<DocumentEntity[]> {
    return this.repository.find({
      where: { encounterId, organizationId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findByType(
    patientId: string,
    organizationId: string,
    documentType: DocumentType,
  ): Promise<DocumentEntity[]> {
    return this.repository.find({
      where: { patientId, organizationId, documentType, deletedAt: IsNull() },
      order: { documentDate: 'DESC' },
    });
  }

  async findAll(
    organizationId: string,
    pagination: PaginationParams,
    filters?: { patientId?: string; encounterId?: string; documentType?: DocumentType },
  ): Promise<PaginatedResponse<DocumentEntity>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.patient', 'patient')
      .leftJoinAndSelect('document.encounter', 'encounter')
      .where('document.organizationId = :organizationId', { organizationId })
      .andWhere('document.deletedAt IS NULL');

    if (filters?.patientId) {
      queryBuilder.andWhere('document.patientId = :patientId', { patientId: filters.patientId });
    }
    if (filters?.encounterId) {
      queryBuilder.andWhere('document.encounterId = :encounterId', { encounterId: filters.encounterId });
    }
    if (filters?.documentType) {
      queryBuilder.andWhere('document.documentType = :documentType', { documentType: filters.documentType });
    }

    queryBuilder
      .orderBy(`document.${sortBy}`, sortOrder)
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

  async create(data: Partial<DocumentEntity>): Promise<DocumentEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: string, organizationId: string, data: Partial<DocumentEntity>): Promise<DocumentEntity | null> {
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
