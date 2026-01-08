import { Injectable, NotFoundException } from '@nestjs/common';
import { ReviewOfSystemsRepository } from '../../../repos/repositories/review-of-systems.repository';
import { PatientRepository } from '../../../repos/repositories/patient.repository';
import { ReviewOfSystemsEntity } from '../../../repos/entities/review-of-systems.entity';
import { ReviewOfSystemsCategory, RequestUser } from '../../../common/types';

export interface CreateReviewOfSystemsDto {
  patientId: string;
  encounterId?: string;
  category: ReviewOfSystemsCategory;
  isPositive: boolean;
  findings?: string;
  notes?: string;
}

export interface CreateBulkReviewOfSystemsDto {
  patientId: string;
  encounterId?: string;
  reviews: Array<{
    category: ReviewOfSystemsCategory;
    isPositive: boolean;
    findings?: string;
    notes?: string;
  }>;
}

export interface UpdateReviewOfSystemsDto {
  isPositive?: boolean;
  findings?: string;
  notes?: string;
}

@Injectable()
export class ReviewOfSystemsService {
  constructor(
    private readonly reviewOfSystemsRepository: ReviewOfSystemsRepository,
    private readonly patientRepository: PatientRepository,
  ) {}

  async create(
    dto: CreateReviewOfSystemsDto,
    user: RequestUser,
    organizationId: string,
  ): Promise<ReviewOfSystemsEntity> {
    const patient = await this.patientRepository.findById(dto.patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const review = await this.reviewOfSystemsRepository.create({
      ...dto,
      organizationId,
      recordedBy: user.userId,
    });

    return review;
  }

  async createBulk(
    dto: CreateBulkReviewOfSystemsDto,
    user: RequestUser,
    organizationId: string,
  ): Promise<ReviewOfSystemsEntity[]> {
    const patient = await this.patientRepository.findById(dto.patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const reviewsData = dto.reviews.map((review) => ({
      ...review,
      patientId: dto.patientId,
      encounterId: dto.encounterId,
      organizationId,
      recordedBy: user.userId,
    }));

    const reviews = await this.reviewOfSystemsRepository.createMany(reviewsData);

    return reviews;
  }

  async findById(id: string, organizationId: string): Promise<ReviewOfSystemsEntity> {
    const review = await this.reviewOfSystemsRepository.findById(id, organizationId);
    if (!review) {
      throw new NotFoundException('Review of systems not found');
    }
    return review;
  }

  async findByPatient(patientId: string, organizationId: string): Promise<ReviewOfSystemsEntity[]> {
    return this.reviewOfSystemsRepository.findByPatient(patientId, organizationId);
  }

  async findByEncounter(encounterId: string, organizationId: string): Promise<ReviewOfSystemsEntity[]> {
    return this.reviewOfSystemsRepository.findByEncounter(encounterId, organizationId);
  }

  async findByCategory(
    patientId: string,
    organizationId: string,
    category: ReviewOfSystemsCategory,
  ): Promise<ReviewOfSystemsEntity[]> {
    return this.reviewOfSystemsRepository.findByCategory(patientId, organizationId, category);
  }

  async update(
    id: string,
    dto: UpdateReviewOfSystemsDto,
    user: RequestUser,
    organizationId: string,
  ): Promise<ReviewOfSystemsEntity> {
    await this.findById(id, organizationId);

    const updated = await this.reviewOfSystemsRepository.update(id, organizationId, dto);

    return updated!;
  }

  async delete(id: string, user: RequestUser, organizationId: string): Promise<void> {
    await this.findById(id, organizationId);
    await this.reviewOfSystemsRepository.softDelete(id, organizationId);
  }
}
