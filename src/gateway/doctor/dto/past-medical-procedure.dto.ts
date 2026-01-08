import {
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreatePastMedicalProcedureDto {
  @IsUUID()
  patientId: string;

  @IsString()
  @MaxLength(255)
  procedureName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  procedureCode?: string;

  @IsOptional()
  @IsDateString()
  procedureDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  performedBy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  facility?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  indication?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  outcome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  complications?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpdatePastMedicalProcedureDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  procedureName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  procedureCode?: string;

  @IsOptional()
  @IsDateString()
  procedureDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  performedBy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  facility?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  indication?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  outcome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  complications?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class PastMedicalProcedureQueryDto {
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
