import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientEntity } from '../entities/patient.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class PatientRepository extends BaseRepository<PatientEntity> {
  constructor(
    @InjectRepository(PatientEntity)
    repository: Repository<PatientEntity>,
  ) {
    super(repository);
  }
}
