import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { AppointmentRepository, AppointmentFilters } from '../../../repos/repositories/appointment.repository';
import { TimeSlotRepository } from '../../../repos/repositories/time-slot.repository';
import { EncounterRepository } from '../../../repos/repositories/encounter.repository';
import { AppointmentEntity } from '../../../repos/entities/appointment.entity';
import {
  AppointmentStatus,
  TimeSlotStatus,
  PaginationParams,
  PaginatedResponse,
  RequestUser,
  EncounterStatus,
  EncounterType,
} from '../../../common/types';

export interface CreateAppointmentDto {
  doctorId: string;
  organizationId: string;
  timeSlotId: string;
  reasonForVisit?: string;
}

export interface CancelAppointmentDto {
  reason: string;
}

// Valid status transitions
const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.SCHEDULED]: [
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
  ],
  [AppointmentStatus.CHECKED_IN]: [
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
  ],
  [AppointmentStatus.IN_PROGRESS]: [
    AppointmentStatus.COMPLETED,
  ],
  [AppointmentStatus.COMPLETED]: [],
  [AppointmentStatus.CANCELLED]: [],
  [AppointmentStatus.NO_SHOW]: [],
};

@Injectable()
export class AppointmentService {
  // 24 hours in milliseconds
  private static readonly CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000;

  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly timeSlotRepository: TimeSlotRepository,
    private readonly encounterRepository: EncounterRepository,
  ) {}

  /**
   * Create a new appointment.
   * Requirements: 3.5, 3.6, 9.1
   */
  async create(
    dto: CreateAppointmentDto,
    user: RequestUser,
  ): Promise<AppointmentEntity> {
    // Get the time slot
    const timeSlot = await this.timeSlotRepository.findById(dto.timeSlotId);
    if (!timeSlot) {
      throw new NotFoundException('Time slot not found');
    }

    // Check if slot is available (prevents double booking)
    if (timeSlot.status !== TimeSlotStatus.AVAILABLE) {
      throw new ConflictException('This time slot is no longer available');
    }

    // Mark slot as booked
    await this.timeSlotRepository.updateStatus(dto.timeSlotId, TimeSlotStatus.BOOKED);

    // Create appointment with SCHEDULED status
    const appointment = await this.appointmentRepository.create({
      patientId: user.userId,
      doctorId: dto.doctorId,
      organizationId: dto.organizationId,
      timeSlotId: dto.timeSlotId,
      appointmentDate: timeSlot.date,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      status: AppointmentStatus.SCHEDULED,
      reasonForVisit: dto.reasonForVisit,
    });

    return appointment;
  }

  /**
   * Find an appointment by ID.
   */
  async findById(id: string): Promise<AppointmentEntity> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  /**
   * Find appointments by patient.
   * Requirements: 4.1
   */
  async findByPatient(
    patientId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<AppointmentEntity>> {
    return this.appointmentRepository.findByPatient(patientId, pagination);
  }

  /**
   * Find appointments by doctor.
   * Requirements: 4.2
   */
  async findByDoctor(
    doctorId: string,
    organizationId: string,
    filters: AppointmentFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<AppointmentEntity>> {
    return this.appointmentRepository.findByDoctor(
      doctorId,
      organizationId,
      filters,
      pagination,
    );
  }

  /**
   * Cancel an appointment.
   * Requirements: 4.3, 4.4, 4.5, 9.5
   */
  async cancel(
    id: string,
    dto: CancelAppointmentDto,
    user: RequestUser,
  ): Promise<AppointmentEntity> {
    const appointment = await this.findById(id);

    // Check if appointment can be cancelled (not already completed/cancelled)
    if (!this.canTransitionTo(appointment.status, AppointmentStatus.CANCELLED)) {
      throw new BadRequestException(
        `Cannot cancel appointment with status '${appointment.status}'`,
      );
    }

    // Check if appointment is in the past
    if (this.isAppointmentInPast(appointment)) {
      throw new BadRequestException('Cannot cancel past appointments');
    }

    // Determine if this is an early or late cancellation
    const isEarlyCancellation = this.isEarlyCancellation(appointment);

    // Update appointment status
    const updated = await this.appointmentRepository.updateStatus(
      id,
      AppointmentStatus.CANCELLED,
      {
        cancellationReason: dto.reason,
        cancelledAt: new Date(),
        cancelledBy: user.userId,
      },
    );

    // Release the time slot only for early cancellations
    if (isEarlyCancellation) {
      await this.timeSlotRepository.updateStatus(
        appointment.timeSlotId,
        TimeSlotStatus.AVAILABLE,
      );
    }
    // For late cancellations, slot remains BOOKED (not released)

    return updated!;
  }

  /**
   * Check in a patient for their appointment.
   * Requirements: 9.2
   */
  async checkIn(id: string, user: RequestUser): Promise<AppointmentEntity> {
    const appointment = await this.findById(id);

    if (!this.canTransitionTo(appointment.status, AppointmentStatus.CHECKED_IN)) {
      throw new BadRequestException(
        `Cannot check in appointment with status '${appointment.status}'`,
      );
    }

    const updated = await this.appointmentRepository.updateStatus(
      id,
      AppointmentStatus.CHECKED_IN,
    );

    return updated!;
  }

  /**
   * Start a visit (creates an encounter).
   * Requirements: 9.3
   */
  async startVisit(
    id: string,
    user: RequestUser,
    organizationId: string,
  ): Promise<AppointmentEntity> {
    const appointment = await this.findById(id);

    if (!this.canTransitionTo(appointment.status, AppointmentStatus.IN_PROGRESS)) {
      throw new BadRequestException(
        `Cannot start visit for appointment with status '${appointment.status}'`,
      );
    }

    // Create an encounter
    const encounter = await this.encounterRepository.create({
      organizationId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      encounterType: EncounterType.CONSULTATION,
      status: EncounterStatus.IN_PROGRESS,
      encounterDate: new Date(),
      startTime: new Date(),
      reasonForVisit: appointment.reasonForVisit,
      createdBy: user.userId,
    });

    // Update appointment status and link encounter
    const updated = await this.appointmentRepository.updateStatus(
      id,
      AppointmentStatus.IN_PROGRESS,
      { encounterId: encounter.id },
    );

    return updated!;
  }

  /**
   * Complete an appointment.
   * Requirements: 9.4
   */
  async complete(id: string, user: RequestUser): Promise<AppointmentEntity> {
    const appointment = await this.findById(id);

    if (!this.canTransitionTo(appointment.status, AppointmentStatus.COMPLETED)) {
      throw new BadRequestException(
        `Cannot complete appointment with status '${appointment.status}'`,
      );
    }

    const updated = await this.appointmentRepository.updateStatus(
      id,
      AppointmentStatus.COMPLETED,
    );

    return updated!;
  }

  /**
   * Mark an appointment as no-show.
   * Requirements: 9.6
   */
  async markNoShow(id: string, user: RequestUser): Promise<AppointmentEntity> {
    const appointment = await this.findById(id);

    if (!this.canTransitionTo(appointment.status, AppointmentStatus.NO_SHOW)) {
      throw new BadRequestException(
        `Cannot mark as no-show appointment with status '${appointment.status}'`,
      );
    }

    const updated = await this.appointmentRepository.updateStatus(
      id,
      AppointmentStatus.NO_SHOW,
    );

    return updated!;
  }

  /**
   * Check if a status transition is valid.
   * Requirements: 9.1-9.6
   */
  canTransitionTo(currentStatus: AppointmentStatus, targetStatus: AppointmentStatus): boolean {
    const validTargets = VALID_TRANSITIONS[currentStatus] || [];
    return validTargets.includes(targetStatus);
  }

  /**
   * Check if an appointment is in the past.
   * Requirements: 4.5
   */
  isAppointmentInPast(appointment: AppointmentEntity): boolean {
    const now = new Date();
    const appointmentDateTime = this.getAppointmentDateTime(appointment);
    return appointmentDateTime < now;
  }

  /**
   * Check if cancellation is early (more than 24 hours before).
   * Requirements: 4.3, 4.4
   */
  isEarlyCancellation(appointment: AppointmentEntity): boolean {
    const now = new Date();
    const appointmentDateTime = this.getAppointmentDateTime(appointment);
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    return timeDiff > AppointmentService.CANCELLATION_WINDOW_MS;
  }

  /**
   * Get the appointment date/time as a Date object.
   */
  private getAppointmentDateTime(appointment: AppointmentEntity): Date {
    const date = new Date(appointment.appointmentDate);
    const [hours, minutes] = appointment.startTime.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Get valid status transitions (for API documentation/validation).
   */
  static getValidTransitions(): Record<AppointmentStatus, AppointmentStatus[]> {
    return { ...VALID_TRANSITIONS };
  }
}
