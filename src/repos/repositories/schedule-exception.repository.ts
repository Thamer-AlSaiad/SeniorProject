import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Between } from 'typeorm';
import { ScheduleExceptionEntity } from '../entities/schedule-exception.entity';

@Injectable()
export class ScheduleExceptionRepository {
  constructor(
    @InjectRepository(ScheduleExceptionEntity)
    private readonly repository: Repository<ScheduleExceptionEntity>,
  ) {}

  async create(data: Partial<ScheduleExceptionEntity>): Promise<ScheduleExceptionEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findById(id: string, organizationId: string): Promise<ScheduleExceptionEntity | null> {
    return this.repository.findOne({
      where: { id, organizationId, deletedAt: IsNull() },
      relations: ['doctor', 'organization'],
    });
  }

  async findByDoctor(doctorId: string, organizationId: string): Promise<ScheduleExceptionEntity[]> {
    return this.repository.find({
      where: { doctorId, organizationId, deletedAt: IsNull() },
      order: { exceptionDate: 'ASC' },
    });
  }

  async findByDateRange(
    doctorId: string,
    organizationId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<ScheduleExceptionEntity[]> {
    return this.repository
      .createQueryBuilder('exception')
      .where('exception.doctorId = :doctorId', { doctorId })
      .andWhere('exception.organizationId = :organizationId', { organizationId })
      .andWhere('exception.exceptionDate >= :fromDate', { fromDate })
      .andWhere('exception.exceptionDate <= :toDate', { toDate })
      .andWhere('exception.deletedAt IS NULL')
      .orderBy('exception.exceptionDate', 'ASC')
      .addOrderBy('exception.startTime', 'ASC')
      .getMany();
  }

  async findByDate(
    doctorId: string,
    date: Date,
  ): Promise<ScheduleExceptionEntity[]> {
    return this.repository.find({
      where: { doctorId, exceptionDate: date, deletedAt: IsNull() },
      order: { startTime: 'ASC' },
    });
  }

  async softDelete(id: string, organizationId: string): Promise<void> {
    await this.repository.update(
      { id, organizationId },
      { deletedAt: new Date() },
    );
  }

  async findUpcoming(doctorId: string, organizationId: string, fromDate: Date): Promise<ScheduleExceptionEntity[]> {
    return this.repository
      .createQueryBuilder('exception')
      .where('exception.doctorId = :doctorId', { doctorId })
      .andWhere('exception.organizationId = :organizationId', { organizationId })
      .andWhere('exception.exceptionDate >= :fromDate', { fromDate })
      .andWhere('exception.deletedAt IS NULL')
      .orderBy('exception.exceptionDate', 'ASC')
      .getMany();
  }

  /**
   * Check if a specific time on a date is blocked by an exception.
   * @param doctorId - The doctor's ID
   * @param date - The date to check
   * @param startTime - Start time in HH:mm format
   * @param endTime - End time in HH:mm format
   * @returns true if the time is blocked, false otherwise
   */
  async isTimeBlocked(
    doctorId: string,
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    const exceptions = await this.repository
      .createQueryBuilder('exception')
      .where('exception.doctorId = :doctorId', { doctorId })
      .andWhere('exception.exceptionDate = :date', { date })
      .andWhere('exception.deletedAt IS NULL')
      .getMany();

    for (const exception of exceptions) {
      // If no start/end time, the whole day is blocked
      if (!exception.startTime || !exception.endTime) {
        return true;
      }
      // Check for time overlap
      if (exception.startTime < endTime && exception.endTime > startTime) {
        return true;
      }
    }

    return false;
  }

  async countByDoctor(doctorId: string, organizationId: string): Promise<number> {
    return this.repository.count({
      where: { doctorId, organizationId, deletedAt: IsNull() },
    });
  }
}
