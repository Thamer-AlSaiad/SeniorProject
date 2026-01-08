import {
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { AppointmentStatus } from '../../../common/types';

/**
 * DTO for creating a new appointment booking.
 * Requirements: 3.4, 3.5
 */
export class CreateBookingDto {
  @IsUUID()
  doctorId: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsUUID()
  timeSlotId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reasonForVisit?: string;
}

/**
 * DTO for cancelling an appointment.
 * Requirements: 4.3, 4.4
 */
export class CancelBookingDto {
  @IsString()
  @MaxLength(500)
  reason: string;
}

/**
 * DTO for querying available time slots.
 * Requirements: 3.3
 */
export class AvailableSlotsQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}

/**
 * DTO for querying patient appointments.
 * Requirements: 4.1
 */
export class PatientAppointmentQueryDto {
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * DTO for querying medical records.
 * Requirements: 5.1
 */
export class MedicalRecordQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
