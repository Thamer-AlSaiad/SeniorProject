import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { AllergyRepository } from '../../../repos/repositories/allergy.repository';
import { PatientRepository } from '../../../repos/repositories/patient.repository';
import { AllergyEntity } from '../../../repos/entities/allergy.entity';
import {
  AllergyType,
  AllergySeverity,
  PaginationParams,
  PaginatedResponse,
  RequestUser,
} from '../../../common/types';

export interface CreateAllergyDto {
  patientId: string;
  allergyType: AllergyType;
  allergen: string;
  severity: AllergySeverity;
  reaction?: string;
  onsetDate?: Date;
  notes?: string;
}

export interface UpdateAllergyDto {
  allergyType?: AllergyType;
  allergen?: string;
  severity?: AllergySeverity;
  reaction?: string;
  onsetDate?: Date;
  isActive?: boolean;
  notes?: string;
}

@Injectable()
export class AllergyService {
  constructor(
    private readonly allergyRepository: AllergyRepository,
    private readonly patientRepository: PatientRepository,
  ) {}

  async create(
    dto: CreateAllergyDto,
    user: RequestUser,
    organizationId: string,
  ): Promise<AllergyEntity> {
    // Verify patient exists
    const patient = await this.patientRepository.findById(dto.patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Check for duplicate allergen
    const isDuplicate = await this.allergyRepository.checkDuplicate(
      dto.patientId,
      organizationId,
      dto.allergen,
    );
    if (isDuplicate) {
      throw new ConflictException('This allergen is already recorded for this patient');
    }

    const allergy = await this.allergyRepository.create({
      ...dto,
      organizationId,
      createdBy: user.userId,
    });

    return allergy;
  }

  async findById(id: string, organizationId: string): Promise<AllergyEntity> {
    const allergy = await this.allergyRepository.findById(id, organizationId);
    if (!allergy) {
      throw new NotFoundException('Allergy not found');
    }
    return allergy;
  }

  async findByPatient(
    patientId: string,
    organizationId: string,
    activeOnly = true,
  ): Promise<AllergyEntity[]> {
    return this.allergyRepository.findByPatient(patientId, organizationId, activeOnly);
  }

  async findAll(
    organizationId: string,
    pagination: PaginationParams,
    patientId?: string,
  ): Promise<PaginatedResponse<AllergyEntity>> {
    return this.allergyRepository.findAll(organizationId, pagination, patientId);
  }

  async update(
    id: string,
    dto: UpdateAllergyDto,
    user: RequestUser,
    organizationId: string,
  ): Promise<AllergyEntity> {
    const existing = await this.findById(id, organizationId);

    // Check for duplicate if allergen is being changed
    if (dto.allergen && dto.allergen !== existing.allergen) {
      const isDuplicate = await this.allergyRepository.checkDuplicate(
        existing.patientId,
        organizationId,
        dto.allergen,
        id,
      );
      if (isDuplicate) {
        throw new ConflictException('This allergen is already recorded for this patient');
      }
    }

    const updated = await this.allergyRepository.update(id, organizationId, {
      ...dto,
      updatedBy: user.userId,
    });

    return updated!;
  }

  async delete(id: string, user: RequestUser, organizationId: string): Promise<void> {
    await this.findById(id, organizationId);
    await this.allergyRepository.softDelete(id, organizationId, user.userId);
  }
}
