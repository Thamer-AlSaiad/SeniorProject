import { Injectable, NotFoundException } from '@nestjs/common';
import { VitalSignRepository } from '../../../repos/repositories/vital-sign.repository';
import { PatientRepository } from '../../../repos/repositories/patient.repository';
import { VitalSignEntity } from '../../../repos/entities/vital-sign.entity';
import {
  VitalSignType,
  PaginationParams,
  PaginatedResponse,
  RequestUser,
} from '../../../common/types';

export interface CreateVitalSignDto {
  patientId: string;
  encounterId?: string;
  type: VitalSignType;
  value: number;
  secondaryValue?: number;
  unit: string;
  recordedAt?: Date;
  notes?: string;
}

export interface CreateBulkVitalSignsDto {
  patientId: string;
  encounterId?: string;
  vitals: Array<{
    type: VitalSignType;
    value: number;
    secondaryValue?: number;
    unit: string;
    notes?: string;
  }>;
}

@Injectable()
export class VitalSignService {
  constructor(
    private readonly vitalSignRepository: VitalSignRepository,
    private readonly patientRepository: PatientRepository,
  ) {}

  async create(
    dto: CreateVitalSignDto,
    user: RequestUser,
    organizationId: string,
  ): Promise<VitalSignEntity> {
    const patient = await this.patientRepository.findById(dto.patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const vitalSign = await this.vitalSignRepository.create({
      ...dto,
      organizationId,
      recordedAt: dto.recordedAt || new Date(),
      recordedBy: user.userId,
    });

    return vitalSign;
  }

  async createBulk(
    dto: CreateBulkVitalSignsDto,
    user: RequestUser,
    organizationId: string,
  ): Promise<VitalSignEntity[]> {
    const patient = await this.patientRepository.findById(dto.patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const recordedAt = new Date();
    const vitalsData = dto.vitals.map((vital) => ({
      ...vital,
      patientId: dto.patientId,
      encounterId: dto.encounterId,
      organizationId,
      recordedAt,
      recordedBy: user.userId,
    }));

    const vitalSigns = await this.vitalSignRepository.createMany(vitalsData);

    return vitalSigns;
  }

  async findById(id: string, organizationId: string): Promise<VitalSignEntity> {
    const vitalSign = await this.vitalSignRepository.findById(id, organizationId);
    if (!vitalSign) {
      throw new NotFoundException('Vital sign not found');
    }
    return vitalSign;
  }

  async findByPatient(patientId: string, organizationId: string): Promise<VitalSignEntity[]> {
    return this.vitalSignRepository.findByPatient(patientId, organizationId);
  }

  async findByEncounter(encounterId: string, organizationId: string): Promise<VitalSignEntity[]> {
    return this.vitalSignRepository.findByEncounter(encounterId, organizationId);
  }

  async findLatestByType(
    patientId: string,
    organizationId: string,
    type: VitalSignType,
  ): Promise<VitalSignEntity | null> {
    return this.vitalSignRepository.findLatestByType(patientId, organizationId, type);
  }

  async findLatestAll(patientId: string, organizationId: string): Promise<Record<VitalSignType, VitalSignEntity | null>> {
    const result: Record<string, VitalSignEntity | null> = {};
    
    for (const type of Object.values(VitalSignType)) {
      result[type] = await this.findLatestByType(patientId, organizationId, type);
    }

    return result as Record<VitalSignType, VitalSignEntity | null>;
  }

  async findAll(
    organizationId: string,
    pagination: PaginationParams,
    patientId?: string,
    encounterId?: string,
  ): Promise<PaginatedResponse<VitalSignEntity>> {
    return this.vitalSignRepository.findAll(organizationId, pagination, patientId, encounterId);
  }

  async delete(id: string, user: RequestUser, organizationId: string): Promise<void> {
    await this.findById(id, organizationId);
    await this.vitalSignRepository.softDelete(id, organizationId);
  }
}
