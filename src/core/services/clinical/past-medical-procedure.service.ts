import { Injectable, NotFoundException } from '@nestjs/common';
import { PastMedicalProcedureRepository } from '../../../repos/repositories/past-medical-procedure.repository';
import { PatientRepository } from '../../../repos/repositories/patient.repository';
import { PastMedicalProcedureEntity } from '../../../repos/entities/past-medical-procedure.entity';
import { PaginationParams, PaginatedResponse, RequestUser } from '../../../common/types';

export interface CreatePastMedicalProcedureDto {
  patientId: string;
  procedureName: string;
  procedureCode?: string;
  procedureDate?: Date;
  performedBy?: string;
  facility?: string;
  indication?: string;
  outcome?: string;
  complications?: string;
  notes?: string;
}

export interface UpdatePastMedicalProcedureDto {
  procedureName?: string;
  procedureCode?: string;
  procedureDate?: Date;
  performedBy?: string;
  facility?: string;
  indication?: string;
  outcome?: string;
  complications?: string;
  notes?: string;
}

@Injectable()
export class PastMedicalProcedureService {
  constructor(
    private readonly procedureRepository: PastMedicalProcedureRepository,
    private readonly patientRepository: PatientRepository,
  ) {}

  async create(
    dto: CreatePastMedicalProcedureDto,
    user: RequestUser,
    organizationId: string,
  ): Promise<PastMedicalProcedureEntity> {
    const patient = await this.patientRepository.findById(dto.patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const procedure = await this.procedureRepository.create({
      ...dto,
      organizationId,
      createdBy: user.userId,
    });

    return procedure;
  }

  async findById(id: string, organizationId: string): Promise<PastMedicalProcedureEntity> {
    const procedure = await this.procedureRepository.findById(id, organizationId);
    if (!procedure) {
      throw new NotFoundException('Past medical procedure not found');
    }
    return procedure;
  }

  async findByPatient(patientId: string, organizationId: string): Promise<PastMedicalProcedureEntity[]> {
    return this.procedureRepository.findByPatient(patientId, organizationId);
  }

  async findAll(
    organizationId: string,
    pagination: PaginationParams,
    patientId?: string,
  ): Promise<PaginatedResponse<PastMedicalProcedureEntity>> {
    return this.procedureRepository.findAll(organizationId, pagination, patientId);
  }

  async update(
    id: string,
    dto: UpdatePastMedicalProcedureDto,
    user: RequestUser,
    organizationId: string,
  ): Promise<PastMedicalProcedureEntity> {
    await this.findById(id, organizationId);

    const updated = await this.procedureRepository.update(id, organizationId, {
      ...dto,
      updatedBy: user.userId,
    });

    return updated!;
  }

  async delete(id: string, user: RequestUser, organizationId: string): Promise<void> {
    await this.findById(id, organizationId);
    await this.procedureRepository.softDelete(id, organizationId, user.userId);
  }
}
