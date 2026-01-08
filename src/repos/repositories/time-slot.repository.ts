import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan, Between } from 'typeorm';
import { TimeSlotEntity } from '../entities/time-slot.entity';
import { TimeSlotStatus } from '../../common/types';

export interface TimeSlotFilters {
  doctorId?: string;
  organizationId?: string;
  scheduleId?: string;
  status?: TimeSlotStatus;
  fromDate?: Date;
  toDate?: Date;
}

@Injectable()
export class TimeSlotRepository {
  constructor(
    @InjectRepository(TimeSlotEntity)
    private readonly repository: Repository<TimeSlotEntity>,
  ) {}

  async create(data: Partial<TimeSlotEntity>): Promise<TimeSlotEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async createMany(data: Partial<TimeSlotEntity>[]): Promise<TimeSlotEntity[]> {
    const entities = this.repository.create(data);
    return this.repository.save(entities);
  }

  async findById(id: string): Promise<TimeSlotEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['doctor', 'organization', 'schedule'],
    });
  }

  async findAvailable(
    doctorId: string,
    organizationId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<TimeSlotEntity[]> {
    return this.repository
      .createQueryBuilder('slot')
      .where('slot.doctorId = :doctorId', { doctorId })
      .andWhere('slot.organizationId = :organizationId', { organizationId })
      .andWhere('slot.status = :status', { status: TimeSlotStatus.AVAILABLE })
      .andWhere('slot.date >= :fromDate', { fromDate })
      .andWhere('slot.date <= :toDate', { toDate })
      .orderBy('slot.date', 'ASC')
      .addOrderBy('slot.startTime', 'ASC')
      .getMany();
  }

  async findByDateRange(
    doctorId: string,
    organizationId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<TimeSlotEntity[]> {
    return this.repository
      .createQueryBuilder('slot')
      .where('slot.doctorId = :doctorId', { doctorId })
      .andWhere('slot.organizationId = :organizationId', { organizationId })
      .andWhere('slot.date >= :fromDate', { fromDate })
      .andWhere('slot.date <= :toDate', { toDate })
      .orderBy('slot.date', 'ASC')
      .addOrderBy('slot.startTime', 'ASC')
      .getMany();
  }

  async findByDate(doctorId: string, date: Date): Promise<TimeSlotEntity[]> {
    return this.repository.find({
      where: { doctorId, date },
      order: { startTime: 'ASC' },
    });
  }

  async updateStatus(id: string, status: TimeSlotStatus): Promise<TimeSlotEntity | null> {
    await this.repository.update({ id }, { status });
    return this.findById(id);
  }

  async updateStatusBulk(ids: string[], status: TimeSlotStatus): Promise<void> {
    if (ids.length === 0) return;
    await this.repository.update({ id: In(ids) }, { status });
  }

  /**
   * Mark old available slots as expired.
   * Slots with dates before the given date and status 'available' will be marked as 'expired'.
   * @param beforeDate - Date before which slots should be expired
   * @returns Number of slots expired
   */
  async expireOldSlots(beforeDate: Date): Promise<number> {
    const result = await this.repository.update(
      {
        date: LessThan(beforeDate),
        status: TimeSlotStatus.AVAILABLE,
      },
      { status: TimeSlotStatus.EXPIRED },
    );
    return result.affected || 0;
  }

  async findByScheduleId(scheduleId: string): Promise<TimeSlotEntity[]> {
    return this.repository.find({
      where: { scheduleId },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async deleteByScheduleId(scheduleId: string): Promise<void> {
    await this.repository.delete({ scheduleId });
  }

  async findAvailableByDateAndTime(
    doctorId: string,
    date: Date,
    startTime: string,
  ): Promise<TimeSlotEntity | null> {
    return this.repository.findOne({
      where: {
        doctorId,
        date,
        startTime,
        status: TimeSlotStatus.AVAILABLE,
      },
    });
  }

  async blockSlotsInRange(
    doctorId: string,
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update(TimeSlotEntity)
      .set({ status: TimeSlotStatus.BLOCKED })
      .where('doctorId = :doctorId', { doctorId })
      .andWhere('date = :date', { date })
      .andWhere('status = :status', { status: TimeSlotStatus.AVAILABLE })
      .andWhere('startTime >= :startTime', { startTime })
      .andWhere('endTime <= :endTime', { endTime })
      .execute();
    return result.affected || 0;
  }

  async unblockSlotsInRange(
    doctorId: string,
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update(TimeSlotEntity)
      .set({ status: TimeSlotStatus.AVAILABLE })
      .where('doctorId = :doctorId', { doctorId })
      .andWhere('date = :date', { date })
      .andWhere('status = :status', { status: TimeSlotStatus.BLOCKED })
      .andWhere('startTime >= :startTime', { startTime })
      .andWhere('endTime <= :endTime', { endTime })
      .execute();
    return result.affected || 0;
  }

  async countByStatus(doctorId: string, organizationId: string, status: TimeSlotStatus): Promise<number> {
    return this.repository.count({
      where: { doctorId, organizationId, status },
    });
  }
}
