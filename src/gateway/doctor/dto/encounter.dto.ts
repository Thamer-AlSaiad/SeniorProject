import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { EncounterType, EncounterStatus } from '../../../common/types';

export class CreateEncounterDto {
  @IsUUID()
  patientId: string;

  @IsEnum(EncounterType)
  encounterType: EncounterType;

  @IsDateString()
  encounterDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reasonForVisit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  chiefComplaint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsUUID()
  idempotencyKey?: string;
}

export class UpdateEncounterDto {
  @IsOptional()
  @IsEnum(EncounterType)
  encounterType?: EncounterType;

  @IsOptional()
  @IsEnum(EncounterStatus)
  status?: EncounterStatus;

  @IsOptional()
  @IsDateString()
  encounterDate?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reasonForVisit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  chiefComplaint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class EncounterQueryDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @IsOptional()
  @IsEnum(EncounterStatus)
  status?: EncounterStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

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
