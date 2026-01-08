import {
  IsString,
  IsOptional,
  IsEmail,
  IsUUID,
  IsBoolean,
  IsInt,
  IsEnum,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AccountStatus } from '../../../common/types';

export class CreateDoctorDto {
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(100)
  password: string;

  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsUUID()
  organizationId: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialization?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;
}

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialization?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;
}

export class DoctorQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsEnum(AccountStatus)
  accountStatus?: AccountStatus;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  sortOrder?: 'ASC' | 'DESC';
}

export class AssignOrganizationDto {
  @IsUUID()
  organizationId: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class RemoveOrganizationDto {
  @IsUUID()
  organizationId: string;
}
