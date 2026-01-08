import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { MedicalRecordRepository } from '../../../repos/repositories/medical-record.repository';
import { EncounterRepository } from '../../../repos/repositories/encounter.repository';
import { PatientRepository } from '../../../repos/repositories/patient.repository';
import { MedicalRecordEntity } from '../../../repos/entities/medical-record.entity';
import {
  PaginationParams,
  PaginatedResponse,
  RequestUser,
  UserType,
} from '../../../common/types';

export interface CreateMedicalRecordDto {
  patientId: string;
  encounterId?: string;
  presentComplaint?: string;
  historyOfPresentingComplaint?: string;
  pastMedicalHistory?: string;
  pastSurgicalHistory?: string;
  drugHistory?: string;
  familyHistory?: string;
  socialHistory?: string;
  physicalExamination?: Record<string, any>;
  assessment?: string;
  plan?: string;
  additionalNotes?: string;
}

export interface UpdateMedicalRecordDto {
  presentComplaint?: string;
  historyOfPresentingComplaint?: string;
  pastMedicalHistory?: string;
  pastSurgicalHistory?: string;
  drugHistory?: string;
  familyHistory?: string;
  socialHistory?: string;
  physicalExamination?: Record<string, any>;
  assessment?: string;
  plan?: string;
  additionalNotes?: string;
}

export interface MedicalRecordFilters {
  patientId?: string;
  doctorId?: string;
  encounterId?: string;
  isFinalized?: boolean;
}

@Injectable()
export class MedicalRecordService {
  constructor(
    private readonly medicalRecordRepository: MedicalRecordRepository,
    private readonly encounterRepository: EncounterRepository,
    private readonly patientRepository: PatientRepository,
  ) {}

  async create(
    dto: CreateMedicalRecordDto,
    user: RequestUser,
    organizationId: string,
  ): Promise<MedicalRecordEntity> {
    // Verify patient exists
    const patient = await this.patientRepository.findById(dto.patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Verify encounter if provided
    if (dto.encounterId) {
      const encounter = await this.encounterRepository.findById(dto.encounterId, organizationId);
      if (!encounter) {
        throw new NotFoundException('Encounter not found');
      }

      // Check if record already exists for this encounter
      const existingRecord = await this.medicalRecordRepository.findByEncounter(
        dto.encounterId,
        organizationId,
      );
      if (existingRecord) {
        throw new BadRequestException('Medical record already exists for this encounter');
      }
    }

    const record = await this.medicalRecordRepository.create({
      ...dto,
      organizationId,
      doctorId: user.userId,
      createdBy: user.userId,
    });

    return record;
  }

  async findById(id: string, organizationId: string): Promise<MedicalRecordEntity> {
    const record = await this.medicalRecordRepository.findById(id, organizationId);
    if (!record) {
      throw new NotFoundException('Medical record not found');
    }
    return record;
  }

  async findByEncounter(encounterId: string, organizationId: string): Promise<MedicalRecordEntity | null> {
    return this.medicalRecordRepository.findByEncounter(encounterId, organizationId);
  }

  async findAll(
    organizationId: string,
    filters: MedicalRecordFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<MedicalRecordEntity>> {
    return this.medicalRecordRepository.findAll(
      { organizationId, ...filters },
      pagination,
    );
  }

  async findByPatient(patientId: string, organizationId: string): Promise<MedicalRecordEntity[]> {
    return this.medicalRecordRepository.findByPatient(patientId, organizationId);
  }

  async update(
    id: string,
    dto: UpdateMedicalRecordDto,
    user: RequestUser,
    organizationId: string,
  ): Promise<MedicalRecordEntity> {
    const existing = await this.findById(id, organizationId);

    // Only the assigned doctor or admin can update
    if (user.userType !== UserType.ADMIN && existing.doctorId !== user.userId) {
      throw new ForbiddenException('You can only update your own medical records');
    }

    // Cannot update finalized records
    if (existing.isFinalized) {
      throw new BadRequestException('Cannot update a finalized medical record');
    }

    const updated = await this.medicalRecordRepository.update(id, organizationId, {
      ...dto,
      updatedBy: user.userId,
    });

    return updated!;
  }

  async updateField(
    id: string,
    field: string,
    value: string | Record<string, any>,
    user: RequestUser,
    organizationId: string,
  ): Promise<MedicalRecordEntity> {
    const allowedFields = [
      'presentComplaint',
      'historyOfPresentingComplaint',
      'pastMedicalHistory',
      'pastSurgicalHistory',
      'drugHistory',
      'familyHistory',
      'socialHistory',
      'physicalExamination',
      'assessment',
      'plan',
      'additionalNotes',
    ];

    if (!allowedFields.includes(field)) {
      throw new BadRequestException(`Invalid field: ${field}`);
    }

    return this.update(id, { [field]: value } as UpdateMedicalRecordDto, user, organizationId);
  }

  async finalize(id: string, user: RequestUser, organizationId: string): Promise<MedicalRecordEntity> {
    const existing = await this.findById(id, organizationId);

    if (user.userType !== UserType.ADMIN && existing.doctorId !== user.userId) {
      throw new ForbiddenException('You can only finalize your own medical records');
    }

    if (existing.isFinalized) {
      throw new BadRequestException('Medical record is already finalized');
    }

    const finalized = await this.medicalRecordRepository.finalize(id, organizationId, user.userId);

    return finalized!;
  }

  async delete(id: string, user: RequestUser, organizationId: string): Promise<void> {
    const record = await this.findById(id, organizationId);

    if (user.userType !== UserType.ADMIN && record.doctorId !== user.userId) {
      throw new ForbiddenException('You can only delete your own medical records');
    }

    if (record.isFinalized) {
      throw new BadRequestException('Cannot delete a finalized medical record');
    }

    await this.medicalRecordRepository.softDelete(id, organizationId, user.userId);
  }
}
