import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ScheduleRepository } from '../../../repos/repositories/schedule.repository';
import { ScheduleEntity } from '../../../repos/entities/schedule.entity';
import { RequestUser } from '../../../common/types';

export interface CreateScheduleDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number;
  effectiveFrom?: Date;
  effectiveUntil?: Date;
}

export interface UpdateScheduleDto {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  slotDurationMinutes?: number;
  isActive?: boolean;
  effectiveFrom?: Date;
  effectiveUntil?: Date;
}

@Injectable()
export class ScheduleService {
  constructor(private readonly scheduleRepository: ScheduleRepository) {}

  /**
   * Create a new schedule for a doctor.
   * Validates that there are no conflicting schedules on the same day.
   * Requirements: 1.2, 1.3, 1.4
   */
  async create(
    dto: CreateScheduleDto,
    user: RequestUser,
    organizationId: string,
  ): Promise<ScheduleEntity> {
    // Validate day of week
    if (dto.dayOfWeek < 0 || dto.dayOfWeek > 6) {
      throw new BadRequestException('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    }

    // Validate time range
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Validate slot duration
    const slotDuration = dto.slotDurationMinutes ?? 30;
    if (slotDuration < 5 || slotDuration > 120) {
      throw new BadRequestException('Slot duration must be between 5 and 120 minutes');
    }

    // Check for conflicts
    const hasConflict = await this.checkConflicts(
      user.userId,
      dto.dayOfWeek,
      dto.startTime,
      dto.endTime,
    );

    if (hasConflict) {
      throw new ConflictException('Schedule conflicts with existing schedule on this day');
    }

    const schedule = await this.scheduleRepository.create({
      doctorId: user.userId,
      organizationId,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      slotDurationMinutes: slotDuration,
      effectiveFrom: dto.effectiveFrom ?? new Date(),
      effectiveUntil: dto.effectiveUntil,
      isActive: true,
    });

    return schedule;
  }

  /**
   * Find a schedule by ID.
   */
  async findById(id: string, organizationId: string): Promise<ScheduleEntity> {
    const schedule = await this.scheduleRepository.findById(id, organizationId);
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    return schedule;
  }

  /**
   * Find all schedules for a doctor.
   */
  async findByDoctor(doctorId: string, organizationId: string): Promise<ScheduleEntity[]> {
    return this.scheduleRepository.findByDoctor(doctorId, organizationId);
  }

  /**
   * Find active schedules for a doctor.
   */
  async findActiveByDoctor(doctorId: string, organizationId: string): Promise<ScheduleEntity[]> {
    return this.scheduleRepository.findActiveByDoctor(doctorId, organizationId);
  }

  /**
   * Update an existing schedule.
   * Validates that updates don't create conflicts.
   * Requirements: 1.5
   */
  async update(
    id: string,
    dto: UpdateScheduleDto,
    user: RequestUser,
    organizationId: string,
  ): Promise<ScheduleEntity> {
    const existing = await this.findById(id, organizationId);

    // Validate day of week if provided
    if (dto.dayOfWeek !== undefined && (dto.dayOfWeek < 0 || dto.dayOfWeek > 6)) {
      throw new BadRequestException('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    }

    // Validate time range if times are being updated
    const newStartTime = dto.startTime ?? existing.startTime;
    const newEndTime = dto.endTime ?? existing.endTime;
    if (newStartTime >= newEndTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Validate slot duration if provided
    if (dto.slotDurationMinutes !== undefined) {
      if (dto.slotDurationMinutes < 5 || dto.slotDurationMinutes > 120) {
        throw new BadRequestException('Slot duration must be between 5 and 120 minutes');
      }
    }

    // Check for conflicts if day or times are changing
    const newDayOfWeek = dto.dayOfWeek ?? existing.dayOfWeek;
    if (
      dto.dayOfWeek !== undefined ||
      dto.startTime !== undefined ||
      dto.endTime !== undefined
    ) {
      const hasConflict = await this.checkConflicts(
        existing.doctorId,
        newDayOfWeek,
        newStartTime,
        newEndTime,
        id, // Exclude current schedule from conflict check
      );

      if (hasConflict) {
        throw new ConflictException('Schedule conflicts with existing schedule on this day');
      }
    }

    const updated = await this.scheduleRepository.update(id, organizationId, dto);
    return updated!;
  }

  /**
   * Delete (soft delete) a schedule.
   * Requirements: 1.6
   */
  async delete(id: string, user: RequestUser, organizationId: string): Promise<void> {
    await this.findById(id, organizationId); // Verify exists
    await this.scheduleRepository.softDelete(id, organizationId);
  }

  /**
   * Check if there are conflicting schedules for a doctor on a specific day.
   * Two schedules conflict if they overlap in time on the same day of week.
   * Requirements: 1.4
   */
  async checkConflicts(
    doctorId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<boolean> {
    return this.scheduleRepository.checkConflicts(
      doctorId,
      dayOfWeek,
      startTime,
      endTime,
      excludeId,
    );
  }

  /**
   * Find schedules for a date range (for slot generation).
   */
  async findActiveSchedulesForDateRange(
    doctorId: string,
    organizationId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<ScheduleEntity[]> {
    return this.scheduleRepository.findActiveSchedulesForDateRange(
      doctorId,
      organizationId,
      fromDate,
      toDate,
    );
  }
}
