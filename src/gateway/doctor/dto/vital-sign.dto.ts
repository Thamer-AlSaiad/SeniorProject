import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VitalSignType } from '../../../common/types';

export class CreateVitalSignDto {
  @IsUUID()
  patientId: string;

  @IsOptional()
  @IsUUID()
  encounterId?: string;

  @IsEnum(VitalSignType)
  type: VitalSignType;

  @IsNumber()
  value: number;

  @IsOptional()
  @IsNumber()
  secondaryValue?: number;

  @IsString()
  @MaxLength(20)
  unit: string;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

class VitalSignItemDto {
  @IsEnum(VitalSignType)
  type: VitalSignType;

  @IsNumber()
  value: number;

  @IsOptional()
  @IsNumber()
  secondaryValue?: number;

  @IsString()
  @MaxLength(20)
  unit: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class CreateBulkVitalSignsDto {
  @IsUUID()
  patientId: string;

  @IsOptional()
  @IsUUID()
  encounterId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VitalSignItemDto)
  vitals: VitalSignItemDto[];
}

export class VitalSignQueryDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsUUID()
  encounterId?: string;

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
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}
