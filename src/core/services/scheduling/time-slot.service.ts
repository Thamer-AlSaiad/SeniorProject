import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TimeSlotRepository } from '../../../repos/repositories/time-slot.repository';
import { ScheduleRepository } from '../../../repos/repositories/schedule.repository';
import { ScheduleExceptionRepository } from '../../../repos/repositories/schedule-exception.repository';
import { TimeSlotEntity } from '../../../repos/entities/time-slot.entity';
import { ScheduleEntity } from '../../../repos/entities/schedule.entity';
import { TimeSlotStatus } from '../../../common/types';

@Injectable()
export class TimeSlotService {
  constructor(
    private readonly timeSlotRepository: TimeSlotRepository,
    private readonly scheduleRepository: ScheduleRepository,
    private readonly scheduleExceptionRepository: ScheduleExceptionRepository,
  ) {}

  /**
   * Generate time slots for a schedule within a date range.
   * Requirements: 2.1, 2.2
   */
  async generateSlots(
    scheduleId: string,
    organizationId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<TimeSlotEntity[]> {
    const schedule = await this.scheduleRepository.findById(scheduleId, organizationId);
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (!schedule.isActive) {
      throw new BadRequestException('Cannot generate slots for inactive schedule');
    }

    const slots: Partial<TimeSlotEntity>[] = [];
    const currentDate = new Date(fromDate);

    while (currentDate <= toDate) {
      // Check if this date matches the schedule's day of week
      if (currentDate.getDay() === schedule.dayOfWeek) {
        // Check if date is within schedule's effective range
        if (this.isDateInEffectiveRange(currentDate, schedule)) {
          // Generate slots for this day
          const daySlots = await this.generateSlotsForDay(
            schedule,
            new Date(currentDate),
          );
          slots.push(...daySlots);
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (slots.length === 0) {
      return [];
    }

    return this.timeSlotRepository.createMany(slots);
  }

  /**
   * Generate slots for a specific day based on schedule.
   * All new slots are created with status 'available'.
   * Requirements: 2.1, 2.2
   */
  private async generateSlotsForDay(
    schedule: ScheduleEntity,
    date: Date,
  ): Promise<Partial<TimeSlotEntity>[]> {
    const slots: Partial<TimeSlotEntity>[] = [];
    const slotDuration = schedule.slotDurationMinutes;

    // Parse start and end times
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Check for exceptions on this date
    const exceptions = await this.scheduleExceptionRepository.findByDate(
      schedule.doctorId,
      date,
    );

    let currentMinutes = startMinutes;
    while (currentMinutes + slotDuration <= endMinutes) {
      const slotStartTime = this.minutesToTime(currentMinutes);
      const slotEndTime = this.minutesToTime(currentMinutes + slotDuration);

      // Check if this slot is blocked by an exception
      const isBlocked = this.isSlotBlockedByException(
        slotStartTime,
        slotEndTime,
        exceptions,
      );

      // Only create available slots (blocked slots are not created)
      if (!isBlocked) {
        slots.push({
          scheduleId: schedule.id,
          doctorId: schedule.doctorId,
          organizationId: schedule.organizationId,
          date,
          startTime: slotStartTime,
          endTime: slotEndTime,
          status: TimeSlotStatus.AVAILABLE, // New slots are always available
        });
      }

      currentMinutes += slotDuration;
    }

    return slots;
  }

  /**
   * Check if a slot is blocked by any exception.
   */
  private isSlotBlockedByException(
    slotStart: string,
    slotEnd: string,
    exceptions: { startTime: string | null; endTime: string | null }[],
  ): boolean {
    for (const exception of exceptions) {
      // If no start/end time, whole day is blocked
      if (!exception.startTime || !exception.endTime) {
        return true;
      }
      // Check for time overlap
      if (exception.startTime < slotEnd && exception.endTime > slotStart) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a date is within the schedule's effective range.
   */
  private isDateInEffectiveRange(date: Date, schedule: ScheduleEntity): boolean {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const effectiveFrom = new Date(schedule.effectiveFrom);
    const effectiveFromOnly = new Date(
      effectiveFrom.getFullYear(),
      effectiveFrom.getMonth(),
      effectiveFrom.getDate(),
    );

    if (dateOnly < effectiveFromOnly) {
      return false;
    }

    if (schedule.effectiveUntil) {
      const effectiveUntil = new Date(schedule.effectiveUntil);
      const effectiveUntilOnly = new Date(
        effectiveUntil.getFullYear(),
        effectiveUntil.getMonth(),
        effectiveUntil.getDate(),
      );
      if (dateOnly > effectiveUntilOnly) {
        return false;
      }
    }

    return true;
  }

  /**
   * Convert minutes from midnight to HH:mm format.
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Find available time slots for a doctor within a date range.
   * Requirements: 2.1
   */
  async findAvailable(
    doctorId: string,
    organizationId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<TimeSlotEntity[]> {
    return this.timeSlotRepository.findAvailable(
      doctorId,
      organizationId,
      fromDate,
      toDate,
    );
  }

  /**
   * Find a time slot by ID.
   */
  async findById(id: string): Promise<TimeSlotEntity> {
    const slot = await this.timeSlotRepository.findById(id);
    if (!slot) {
      throw new NotFoundException('Time slot not found');
    }
    return slot;
  }

  /**
   * Mark a time slot as booked.
   * Requirements: 2.3
   */
  async markAsBooked(slotId: string): Promise<TimeSlotEntity> {
    const slot = await this.findById(slotId);

    if (slot.status !== TimeSlotStatus.AVAILABLE) {
      throw new BadRequestException('Time slot is not available for booking');
    }

    const updated = await this.timeSlotRepository.updateStatus(
      slotId,
      TimeSlotStatus.BOOKED,
    );
    return updated!;
  }

  /**
   * Mark a time slot as available (release it).
   * Requirements: 2.3
   */
  async markAsAvailable(slotId: string): Promise<TimeSlotEntity> {
    const slot = await this.findById(slotId);

    if (slot.status !== TimeSlotStatus.BOOKED) {
      throw new BadRequestException('Time slot is not booked');
    }

    const updated = await this.timeSlotRepository.updateStatus(
      slotId,
      TimeSlotStatus.AVAILABLE,
    );
    return updated!;
  }

  /**
   * Block time slots in a range (for schedule exceptions).
   * Requirements: 2.4
   */
  async blockSlots(
    doctorId: string,
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<number> {
    return this.timeSlotRepository.blockSlotsInRange(
      doctorId,
      date,
      startTime,
      endTime,
    );
  }

  /**
   * Unblock time slots in a range.
   */
  async unblockSlots(
    doctorId: string,
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<number> {
    return this.timeSlotRepository.unblockSlotsInRange(
      doctorId,
      date,
      startTime,
      endTime,
    );
  }

  /**
   * Expire old available slots (slots with dates in the past).
   * This should be called by a cron job.
   * Requirements: 2.4
   */
  async expireOldSlots(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.timeSlotRepository.expireOldSlots(today);
  }

  /**
   * Find slots by date range.
   */
  async findByDateRange(
    doctorId: string,
    organizationId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<TimeSlotEntity[]> {
    return this.timeSlotRepository.findByDateRange(
      doctorId,
      organizationId,
      fromDate,
      toDate,
    );
  }

  /**
   * Calculate the expected number of slots for a schedule.
   * This is a pure function useful for testing.
   */
  static calculateExpectedSlotCount(
    startTime: string,
    endTime: string,
    slotDurationMinutes: number,
  ): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const totalMinutes = endMinutes - startMinutes;

    return Math.floor(totalMinutes / slotDurationMinutes);
  }
}
