import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ScheduleExceptionRepository } from '../../../repos/repositories/schedule-exception.repository';
import { AppointmentRepository } from '../../../repos/repositories/appointment.repository';
import { TimeSlotRepository } from '../../../repos/repositories/time-slot.repository';
import { ScheduleExceptionEntity } from '../../../repos/entities/schedule-exception.entity';
import { AppointmentEntity } from '../../../repos/entities/appointment.entity';
import { RequestUser, TimeSlotStatus, AppointmentStatus } from '../../../common/types';

export interface CreateScheduleExceptionDto {
  exceptionDate: Date;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface AffectedAppointment {
  appointment: AppointmentEntity;
  requiresNotification: boolean;
}

@Injectable()
export class ScheduleExceptionService {
  constructor(
    private readonly scheduleExceptionRepository: ScheduleExceptionRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly timeSlotRepository: TimeSlotRepository,
  ) {}

  /**
   * Create a schedule exception (block time).
   * Requirements: 10.1, 10.2
   */
  async create(
    dto: CreateScheduleExceptionDto,
    user: RequestUser,
    organizationId: string,
  ): Promise<{ exception: ScheduleExceptionEntity; affectedAppointments: AffectedAppointment[] }> {
    // Validate time range if provided
    if (dto.startTime && dto.endTime && dto.startTime >= dto.endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Validate that exception date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exceptionDate = new Date(dto.exceptionDate);
    exceptionDate.setHours(0, 0, 0, 0);
    
    if (exceptionDate < today) {
      throw new BadRequestException('Cannot create exception for past dates');
    }

    // Get affected appointments before creating exception
    const affectedAppointments = await this.getAffectedAppointments(
      user.userId,
      organizationId,
      dto.exceptionDate,
      dto.startTime,
      dto.endTime,
    );

    // Create the exception
    const exception = await this.scheduleExceptionRepository.create({
      doctorId: user.userId,
      organizationId,
      exceptionDate: dto.exceptionDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      reason: dto.reason,
    });

    // Block affected time slots
    if (dto.startTime && dto.endTime) {
      await this.timeSlotRepository.blockSlotsInRange(
        user.userId,
        dto.exceptionDate,
        dto.startTime,
        dto.endTime,
      );
    } else {
      // Block all slots for the day
      await this.timeSlotRepository.blockSlotsInRange(
        user.userId,
        dto.exceptionDate,
        '00:00',
        '23:59',
      );
    }

    return {
      exception,
      affectedAppointments: affectedAppointments.map((apt) => ({
        appointment: apt,
        requiresNotification: true,
      })),
    };
  }

  /**
   * Find an exception by ID.
   */
  async findById(id: string, organizationId: string): Promise<ScheduleExceptionEntity> {
    const exception = await this.scheduleExceptionRepository.findById(id, organizationId);
    if (!exception) {
      throw new NotFoundException('Schedule exception not found');
    }
    return exception;
  }

  /**
   * Find all exceptions for a doctor.
   */
  async findByDoctor(
    doctorId: string,
    organizationId: string,
  ): Promise<ScheduleExceptionEntity[]> {
    return this.scheduleExceptionRepository.findByDoctor(doctorId, organizationId);
  }

  /**
   * Find exceptions within a date range.
   */
  async findByDateRange(
    doctorId: string,
    organizationId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<ScheduleExceptionEntity[]> {
    return this.scheduleExceptionRepository.findByDateRange(
      doctorId,
      organizationId,
      fromDate,
      toDate,
    );
  }

  /**
   * Delete a schedule exception.
   * Requirements: 10.3
   */
  async delete(
    id: string,
    user: RequestUser,
    organizationId: string,
  ): Promise<void> {
    const exception = await this.findById(id, organizationId);

    // Unblock the time slots
    if (exception.startTime && exception.endTime) {
      await this.timeSlotRepository.unblockSlotsInRange(
        exception.doctorId,
        exception.exceptionDate,
        exception.startTime,
        exception.endTime,
      );
    } else {
      // Unblock all slots for the day
      await this.timeSlotRepository.unblockSlotsInRange(
        exception.doctorId,
        exception.exceptionDate,
        '00:00',
        '23:59',
      );
    }

    await this.scheduleExceptionRepository.softDelete(id, organizationId);
  }

  /**
   * Get appointments affected by a potential exception.
   * Requirements: 10.2
   */
  async getAffectedAppointments(
    doctorId: string,
    organizationId: string,
    exceptionDate: Date,
    startTime?: string,
    endTime?: string,
  ): Promise<AppointmentEntity[]> {
    // Get all appointments for the doctor on the exception date
    const appointments = await this.appointmentRepository.findByDateRange(
      doctorId,
      organizationId,
      exceptionDate,
      exceptionDate,
    );

    // Filter to only active appointments (not cancelled, completed, or no-show)
    const activeStatuses = [
      AppointmentStatus.SCHEDULED,
      AppointmentStatus.CHECKED_IN,
    ];

    return appointments.filter((apt) => {
      // Only consider active appointments
      if (!activeStatuses.includes(apt.status)) {
        return false;
      }

      // If no time range specified, all appointments on that day are affected
      if (!startTime || !endTime) {
        return true;
      }

      // Check if appointment overlaps with exception time range
      return this.timeRangesOverlap(
        apt.startTime,
        apt.endTime,
        startTime,
        endTime,
      );
    });
  }

  /**
   * Check if a specific time is blocked by an exception.
   */
  async isTimeBlocked(
    doctorId: string,
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    return this.scheduleExceptionRepository.isTimeBlocked(
      doctorId,
      date,
      startTime,
      endTime,
    );
  }

  /**
   * Check if two time ranges overlap.
   */
  private timeRangesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    return start1 < end2 && end1 > start2;
  }

  /**
   * Get upcoming exceptions for a doctor.
   */
  async findUpcoming(
    doctorId: string,
    organizationId: string,
  ): Promise<ScheduleExceptionEntity[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.scheduleExceptionRepository.findUpcoming(doctorId, organizationId, today);
  }
}
