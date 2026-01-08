import { Injectable, NotFoundException } from '@nestjs/common';
import { EncounterRepository } from '../../../repos/repositories/encounter.repository';
import { MedicalRecordRepository } from '../../../repos/repositories/medical-record.repository';
import { AllergyRepository } from '../../../repos/repositories/allergy.repository';
import { EncounterEntity } from '../../../repos/entities/encounter.entity';
import { MedicalRecordEntity } from '../../../repos/entities/medical-record.entity';
import { AllergyEntity } from '../../../repos/entities/allergy.entity';
import { PaginationParams, PaginatedResponse, EncounterStatus } from '../../../common/types';

/**
 * Service for patient access to their own medical records.
 * Only returns finalized records to ensure patients see complete, reviewed information.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
@Injectable()
export class PatientMedicalRecordService {
  constructor(
    private readonly encounterRepository: EncounterRepository,
    private readonly medicalRecordRepository: MedicalRecordRepository,
    private readonly allergyRepository: AllergyRepository,
  ) {}

  /**
   * Find all encounters for a patient.
   * Returns encounters that are completed (past visits).
   * 
   * Requirements: 5.1 - Display list of past encounters
   */
  async findEncounters(
    patientId: string,
    organizationId: string,
    pagination: PaginationParams = {},
  ): Promise<PaginatedResponse<EncounterEntity>> {
    return this.encounterRepository.findAll(
      {
        organizationId,
        patientId,
        status: EncounterStatus.COMPLETED,
      },
      pagination,
    );
  }

  /**
   * Find a specific medical record by ID.
   * Only returns the record if it is finalized.
   * 
   * Requirements: 5.2, 5.3 - Only show finalized records
   */
  async findMedicalRecord(
    recordId: string,
    patientId: string,
    organizationId: string,
  ): Promise<MedicalRecordEntity> {
    const record = await this.medicalRecordRepository.findById(recordId, organizationId);

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    // Verify the record belongs to the patient
    if (record.patientId !== patientId) {
      throw new NotFoundException('Medical record not found');
    }

    // Only return finalized records to patients
    if (!record.isFinalized) {
      throw new NotFoundException('Medical record not found');
    }

    return record;
  }

  /**
   * Find all finalized medical records for a patient.
   * 
   * Requirements: 5.2, 5.3, 5.4 - Display finalized records with allergies, vital signs, clinical notes
   */
  async findMedicalRecords(
    patientId: string,
    organizationId: string,
    pagination: PaginationParams = {},
  ): Promise<PaginatedResponse<MedicalRecordEntity>> {
    return this.medicalRecordRepository.findAll(
      {
        organizationId,
        patientId,
        isFinalized: true,
      },
      pagination,
    );
  }

  /**
   * Find medical record by encounter ID.
   * Only returns the record if it is finalized.
   * 
   * Requirements: 5.2 - Display finalized medical record summary
   */
  async findMedicalRecordByEncounter(
    encounterId: string,
    patientId: string,
    organizationId: string,
  ): Promise<MedicalRecordEntity> {
    const record = await this.medicalRecordRepository.findByEncounter(encounterId, organizationId);

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    // Verify the record belongs to the patient
    if (record.patientId !== patientId) {
      throw new NotFoundException('Medical record not found');
    }

    // Only return finalized records to patients
    if (!record.isFinalized) {
      throw new NotFoundException('Medical record not found');
    }

    return record;
  }

  /**
   * Find all active allergies for a patient.
   * 
   * Requirements: 5.5 - Display current allergy list
   */
  async findAllergies(
    patientId: string,
    organizationId: string,
  ): Promise<AllergyEntity[]> {
    return this.allergyRepository.findByPatient(patientId, organizationId, true);
  }
}
