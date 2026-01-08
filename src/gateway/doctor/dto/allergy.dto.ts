import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { AllergyType, AllergySeverity } from '../../../common/types';

export class CreateAllergyDto {
  @IsUUID()
  patientId: string;

  @IsEnum(AllergyType)
  allergyType: AllergyType;

  @IsString()
  @MaxLength(200)
  allergen: string;

  @IsEnum(AllergySeverity)
  severity: AllergySeverity;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reaction?: string;

  @IsOptional()
  @IsDateString()
  onsetDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpdateAllergyDto {
  @IsOptional()
  @IsEnum(AllergyType)
  allergyType?: AllergyType;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  allergen?: string;

  @IsOptional()
  @IsEnum(AllergySeverity)
  severity?: AllergySeverity;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reaction?: string;

  @IsOptional()
  @IsDateString()
  onsetDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class AllergyQueryDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

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
