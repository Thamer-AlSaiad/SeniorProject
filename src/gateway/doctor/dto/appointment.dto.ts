import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { AppointmentStatus } from '../../../common/types';

export class AppointmentQueryDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

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

export class CancelAppointmentDto {
  @IsString()
  @MaxLength(500)
  reason: string;
}
