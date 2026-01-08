import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorEntity } from '../entities/doctor.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class DoctorRepository extends BaseRepository<DoctorEntity> {
  constructor(
    @InjectRepository(DoctorEntity)
    repository: Repository<DoctorEntity>,
  ) {
    super(repository);
  }
}
