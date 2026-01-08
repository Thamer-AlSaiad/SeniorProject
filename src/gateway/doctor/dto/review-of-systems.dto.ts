import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReviewOfSystemsCategory } from '../../../common/types';

export class CreateReviewOfSystemsDto {
  @IsUUID()
  patientId: string;

  @IsOptional()
  @IsUUID()
  encounterId?: string;

  @IsEnum(ReviewOfSystemsCategory)
  category: ReviewOfSystemsCategory;

  @IsBoolean()
  isPositive: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  findings?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

class ReviewOfSystemsItemDto {
  @IsEnum(ReviewOfSystemsCategory)
  category: ReviewOfSystemsCategory;

  @IsBoolean()
  isPositive: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  findings?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class CreateBulkReviewOfSystemsDto {
  @IsUUID()
  patientId: string;

  @IsOptional()
  @IsUUID()
  encounterId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewOfSystemsItemDto)
  reviews: ReviewOfSystemsItemDto[];
}

export class UpdateReviewOfSystemsDto {
  @IsOptional()
  @IsBoolean()
  isPositive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  findings?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
