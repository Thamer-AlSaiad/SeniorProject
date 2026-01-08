import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, LessThanOrEqual, MoreThanOrEqual, And } from 'typeorm';
import { ScheduleEntity } from '../entities/schedule.entity';

export interface ScheduleFilters {
  organizationId: string;
  doctorId?: string;
  dayOfWeek?: number;
  isActive?: boolean;
}

@Injectable()
export class ScheduleRepository {
  constructor(
    @InjectRepository(ScheduleEntity)
    private readonly repository: Repository<ScheduleEntity>,
  ) {}

  async create(data: Partial<ScheduleEntity>): Promise<ScheduleEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findById(id: string, organizationId: string): Promise<ScheduleEntity | null> {
    return this.repository.findOne({
      where: { id, organizationId, deletedAt: IsNull() },
      relations: ['doctor', 'organization'],
    });
  }

  async findByDoctor(doctorId: string, organizationId: string): Promise<ScheduleEntity[]> {
    return this.repository.find({
      where: { doctorId, organizationId, deletedAt: IsNull() },
      relations: ['doctor', 'organization'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async findActiveByDoctor(doctorId: string, organizationId: string): Promise<ScheduleEntity[]> {
    return this.repository.find({
      where: { doctorId, organizationId, isActive: true, deletedAt: IsNull() },
      relations: ['doctor', 'organization'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async update(id: string, organizationId: string, data: Partial<ScheduleEntity>): Promise<ScheduleEntity | null> {
    await this.repository.update(
      { id, organizationId, deletedAt: IsNull() },
      data,
    );
    return this.findById(id, organizationId);
  }

  async softDelete(id: string, organizationId: string): Promise<void> {
    await this.repository.update(
      { id, organizationId },
      { deletedAt: new Date(), isActive: false },
    );
  }

  /**
   * Check if there are conflicting schedules for a doctor on a specific day.
   * Two schedules conflict if they overlap in time on the same day of week.
   * @param doctorId - The doctor's ID
   * @param dayOfWeek - Day of week (0-6)
   * @param startTime - Start time in HH:mm format
   * @param endTime - End time in HH:mm format
   * @param excludeId - Optional schedule ID to exclude (for updates)
   * @returns true if conflicts exist, false otherwise
   */
  async checkConflicts(
    doctorId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<boolean> {
    const queryBuilder = this.repository
      .createQueryBuilder('schedule')
      .where('schedule.doctorId = :doctorId', { doctorId })
      .andWhere('schedule.dayOfWeek = :dayOfWeek', { dayOfWeek })
      .andWhere('schedule.deletedAt IS NULL')
      .andWhere('schedule.isActive = true')
      // Check for time overlap: new schedule overlaps if:
      // (new.start < existing.end) AND (new.end > existing.start)
      .andWhere('schedule.startTime < :endTime', { endTime })
      .andWhere('schedule.endTime > :startTime', { startTime });

    if (excludeId) {
      queryBuilder.andWhere('schedule.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  async findByDayOfWeek(doctorId: string, dayOfWeek: number, organizationId: string): Promise<ScheduleEntity[]> {
    return this.repository.find({
      where: {
        doctorId,
        dayOfWeek,
        organizationId,
        isActive: true,
        deletedAt: IsNull(),
      },
      order: { startTime: 'ASC' },
    });
  }

  async findActiveSchedulesForDateRange(
    doctorId: string,
    organizationId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<ScheduleEntity[]> {
    return this.repository
      .createQueryBuilder('schedule')
      .where('schedule.doctorId = :doctorId', { doctorId })
      .andWhere('schedule.organizationId = :organizationId', { organizationId })
      .andWhere('schedule.isActive = true')
      .andWhere('schedule.deletedAt IS NULL')
      .andWhere('schedule.effectiveFrom <= :toDate', { toDate })
      .andWhere('(schedule.effectiveUntil IS NULL OR schedule.effectiveUntil >= :fromDate)', { fromDate })
      .orderBy('schedule.dayOfWeek', 'ASC')
      .addOrderBy('schedule.startTime', 'ASC')
      .getMany();
  }
}
