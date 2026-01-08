import { Injectable } from '@nestjs/common';
import { DoctorRepository } from '../../../repos/repositories/doctor.repository';
import { DoctorEntity } from '../../../repos/entities/doctor.entity';
import { BaseProfileService } from './base-profile.service';

@Injectable()
export class DoctorProfileService extends BaseProfileService<DoctorEntity> {
  constructor(repository: DoctorRepository) {
    super(repository);
  }
}
