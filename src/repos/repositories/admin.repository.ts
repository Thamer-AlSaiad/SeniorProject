import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminEntity } from '../entities/admin.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class AdminRepository extends BaseRepository<AdminEntity> {
  constructor(
    @InjectRepository(AdminEntity)
    repository: Repository<AdminEntity>,
  ) {
    super(repository);
  }
}
