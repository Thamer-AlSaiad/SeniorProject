import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EncounterRepository } from '../../../repos/repositories/encounter.repository';
import { PatientRepository } from '../../../repos/repositories/patient.repository';
import { EncounterEntity } from '../../../repos/entities/encounter.entity';
import {
  EncounterStatus,
  EncounterType,
  PaginationParams,
  PaginatedResponse,
  RequestUser,
  UserType,
} from '../../../common/types';

export interface CreateEncounterDto {
  patientId: string;
  encounterType: EncounterType;
  encounterDate: Date;
  reasonForVisit?: string;
  chiefComplaint?: string;
  location?: string;
  notes?: string;
  idempotencyKey?: string;
}

export interface UpdateEncounterDto {
  encounterType?: EncounterType;
  status?: EncounterStatus;
  encounterDate?: Date;
  startTime?: Date;
  endTime?: Date;
  reasonForVisit?: string;
  chiefComplaint?: string;
  location?: string;
  notes?: string;
}

export interface EncounterFilters {
  patientId?: string;
  doctorId?: string;
  status?: EncounterStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

@Injectable()
export class EncounterService {
  constructor(
    private readonly encounterRepository: EncounterRepository,
    private readonly patientRepository: PatientRepository,
  ) {}

  async create(
    dto: CreateEncounterDto,
    user: RequestUser,
    organizationId: string,
  ): Promise<EncounterEntity> {
    // Idempotency check
    if (dto.idempotencyKey) {
      const existing = await this.encounterRepository.findByIdempotencyKey(
        dto.idempotencyKey,
        organizationId,
      );
      if (existing) return existing;
    }

    // Verify patient exists
    const patient = await this.patientRepository.findById(dto.patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const encounter = await this.encounterRepository.create({
      ...dto,
      organizationId,
      doctorId: user.userId,
      status: EncounterStatus.PLANNED,
      createdBy: user.userId,
    });

    return encounter;
  }

  async findById(id: string, organizationId: string): Promise<EncounterEntity> {
    const encounter = await this.encounterRepository.findById(id, organizationId);
    if (!encounter) {
      throw new NotFoundException('Encounter not found');
    }
    return encounter;
  }

  async findAll(
    organizationId: string,
    filters: EncounterFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<EncounterEntity>> {
    return this.encounterRepository.findAll(
      { organizationId, ...filters },
      pagination,
    );
  }

  async findByPatient(patientId: string, organizationId: string): Promise<EncounterEntity[]> {
    return this.encounterRepository.findByPatient(patientId, organizationId);
  }

  async findActiveByDoctor(doctorId: string, organizationId: string): Promise<EncounterEntity[]> {
    return this.encounterRepository.findActiveByDoctor(doctorId, organizationId);
  }

  async update(
    id: string,
    dto: UpdateEncounterDto,
    user: RequestUser,
    organizationId: string,
  ): Promise<EncounterEntity> {
    const existing = await this.findById(id, organizationId);

    // Only the assigned doctor or admin can update
    if (user.userType !== UserType.ADMIN && existing.doctorId !== user.userId) {
      throw new ForbiddenException('You can only update your own encounters');
    }

    // Cannot update completed/cancelled encounters
    if ([EncounterStatus.COMPLETED, EncounterStatus.CANCELLED].includes(existing.status)) {
      throw new BadRequestException('Cannot update a completed or cancelled encounter');
    }

    const updated = await this.encounterRepository.update(id, organizationId, {
      ...dto,
      updatedBy: user.userId,
    });

    return updated!;
  }

  async startEncounter(id: string, user: RequestUser, organizationId: string): Promise<EncounterEntity> {
    const encounter = await this.findById(id, organizationId);

    if (encounter.status !== EncounterStatus.PLANNED) {
      throw new BadRequestException('Can only start a planned encounter');
    }

    return this.update(
      id,
      { status: EncounterStatus.IN_PROGRESS, startTime: new Date() },
      user,
      organizationId,
    );
  }

  async completeEncounter(id: string, user: RequestUser, organizationId: string): Promise<EncounterEntity> {
    const encounter = await this.findById(id, organizationId);

    if (encounter.status !== EncounterStatus.IN_PROGRESS) {
      throw new BadRequestException('Can only complete an in-progress encounter');
    }

    return this.update(
      id,
      { status: EncounterStatus.COMPLETED, endTime: new Date() },
      user,
      organizationId,
    );
  }

  async cancelEncounter(id: string, user: RequestUser, organizationId: string): Promise<EncounterEntity> {
    const encounter = await this.findById(id, organizationId);

    if (encounter.status === EncounterStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed encounter');
    }

    return this.update(
      id,
      { status: EncounterStatus.CANCELLED },
      user,
      organizationId,
    );
  }

  async delete(id: string, user: RequestUser, organizationId: string): Promise<void> {
    const encounter = await this.findById(id, organizationId);

    if (user.userType !== UserType.ADMIN && encounter.doctorId !== user.userId) {
      throw new ForbiddenException('You can only delete your own encounters');
    }

    await this.encounterRepository.softDelete(id, organizationId, user.userId);
  }
}
