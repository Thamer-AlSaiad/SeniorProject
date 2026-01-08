import { Injectable } from '@nestjs/common';
import { PatientRepository } from '../../../repos/repositories/patient.repository';
import { PatientEntity } from '../../../repos/entities/patient.entity';
import { BaseProfileService } from './base-profile.service';

@Injectable()
export class PatientProfileService extends BaseProfileService<PatientEntity> {
  constructor(repository: PatientRepository) {
    super(repository);
  }
}
