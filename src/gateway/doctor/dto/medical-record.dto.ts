import {
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsObject,
  MaxLength,
} from 'class-validator';

export class CreateMedicalRecordDto {
  @IsUUID()
  patientId: string;

  @IsOptional()
  @IsUUID()
  encounterId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  presentComplaint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  historyOfPresentingComplaint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  pastMedicalHistory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  pastSurgicalHistory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  drugHistory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  familyHistory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  socialHistory?: string;

  @IsOptional()
  @IsObject()
  physicalExamination?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  assessment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  plan?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  additionalNotes?: string;
}

export class UpdateMedicalRecordDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  presentComplaint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  historyOfPresentingComplaint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  pastMedicalHistory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  pastSurgicalHistory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  drugHistory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  familyHistory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  socialHistory?: string;

  @IsOptional()
  @IsObject()
  physicalExamination?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  assessment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  plan?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  additionalNotes?: string;
}

export class UpdateMedicalRecordFieldDto {
  @IsString()
  field: string;

  @IsString()
  @MaxLength(10000)
  value: string;
}

export class MedicalRecordQueryDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @IsOptional()
  @IsUUID()
  encounterId?: string;

  @IsOptional()
  @IsBoolean()
  isFinalized?: boolean;

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
