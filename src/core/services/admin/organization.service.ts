import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { OrganizationRepository, OrganizationFilters } from '../../../repos/repositories/organization.repository';
import { DoctorOrganizationRepository } from '../../../repos/repositories/doctor-organization.repository';
import { AppointmentRepository } from '../../../repos/repositories/appointment.repository';
import { OrganizationEntity } from '../../../repos/entities/organization.entity';
import { DoctorEntity } from '../../../repos/entities/doctor.entity';
import { RequestUser, PaginationParams, PaginatedResponse, AppointmentStatus } from '../../../common/types';

export interface CreateOrganizationDto {
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  settings?: Record<string, any>;
}

export interface UpdateOrganizationDto {
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  settings?: Record<string, any>;
}

export interface OrganizationStats {
  totalDoctors: number;
  totalAppointments: number;
  scheduledAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
}

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly doctorOrganizationRepository: DoctorOrganizationRepository,
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  /**
   * Create a new organization.
   * Requirements: 6.3
   */
  async create(dto: CreateOrganizationDto, user: RequestUser): Promise<OrganizationEntity> {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new BadRequestException('Organization name is required');
    }

    // Check for duplicate code if provided
    if (dto.code) {
      const existsByCode = await this.organizationRepository.existsByCode(dto.code);
      if (existsByCode) {
        throw new ConflictException('Organization with this code already exists');
      }
    }

    return this.organizationRepository.create({
      name: dto.name.trim(),
      code: dto.code?.trim(),
      address: dto.address?.trim(),
      phone: dto.phone?.trim(),
      email: dto.email?.trim(),
      settings: dto.settings,
      isActive: true,
    });
  }


  /**
   * Find all organizations with pagination and optional search.
   * Requirements: 6.1, 6.2
   */
  async findAll(
    pagination: PaginationParams,
    search?: string,
  ): Promise<PaginatedResponse<OrganizationEntity>> {
    const filters: OrganizationFilters = {};
    if (search) {
      filters.search = search;
    }
    return this.organizationRepository.findAll(pagination, filters);
  }

  /**
   * Find organization by ID.
   */
  async findById(id: string): Promise<OrganizationEntity> {
    const organization = await this.organizationRepository.findById(id);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  /**
   * Find all active organizations (for patient booking).
   * Requirements: 6.5
   */
  async findActive(): Promise<OrganizationEntity[]> {
    return this.organizationRepository.findActive();
  }

  /**
   * Update an organization.
   * Requirements: 6.4
   */
  async update(
    id: string,
    dto: UpdateOrganizationDto,
    user: RequestUser,
  ): Promise<OrganizationEntity> {
    const existing = await this.findById(id);

    // Check for duplicate code if being updated
    if (dto.code && dto.code !== existing.code) {
      const existsByCode = await this.organizationRepository.existsByCode(dto.code, id);
      if (existsByCode) {
        throw new ConflictException('Organization with this code already exists');
      }
    }

    const updateData: Partial<OrganizationEntity> = {};
    if (dto.name !== undefined) updateData.name = dto.name.trim();
    if (dto.code !== undefined) updateData.code = dto.code?.trim();
    if (dto.address !== undefined) updateData.address = dto.address?.trim();
    if (dto.phone !== undefined) updateData.phone = dto.phone?.trim();
    if (dto.email !== undefined) updateData.email = dto.email?.trim();
    if (dto.settings !== undefined) updateData.settings = dto.settings;

    const updated = await this.organizationRepository.update(id, updateData);
    return updated!;
  }

  /**
   * Deactivate an organization (prevents new bookings).
   * Requirements: 6.5
   */
  async deactivate(id: string, user: RequestUser): Promise<OrganizationEntity> {
    await this.findById(id); // Verify exists
    const updated = await this.organizationRepository.setActive(id, false);
    return updated!;
  }

  /**
   * Activate an organization.
   */
  async activate(id: string, user: RequestUser): Promise<OrganizationEntity> {
    await this.findById(id); // Verify exists
    const updated = await this.organizationRepository.setActive(id, true);
    return updated!;
  }

  /**
   * Delete an organization (soft delete).
   */
  async delete(id: string, user: RequestUser): Promise<void> {
    await this.findById(id); // Verify exists
    await this.organizationRepository.softDelete(id);
  }

  /**
   * Get doctors associated with an organization.
   * Requirements: 6.6
   */
  async getDoctors(organizationId: string): Promise<DoctorEntity[]> {
    await this.findById(organizationId); // Verify exists
    const associations = await this.doctorOrganizationRepository.findByOrganization(organizationId);
    return associations.map((assoc) => assoc.doctor);
  }

  /**
   * Get statistics for an organization.
   * Requirements: 6.6
   */
  async getStatistics(organizationId: string): Promise<OrganizationStats> {
    await this.findById(organizationId); // Verify exists

    const totalDoctors = await this.doctorOrganizationRepository.countByOrganization(organizationId);

    // Get appointment counts by status
    const scheduledCount = await this.appointmentRepository.countByOrganizationAndStatus(
      organizationId,
      AppointmentStatus.SCHEDULED,
    );
    const completedCount = await this.appointmentRepository.countByOrganizationAndStatus(
      organizationId,
      AppointmentStatus.COMPLETED,
    );
    const cancelledCount = await this.appointmentRepository.countByOrganizationAndStatus(
      organizationId,
      AppointmentStatus.CANCELLED,
    );

    const totalAppointments = scheduledCount + completedCount + cancelledCount;

    return {
      totalDoctors,
      totalAppointments,
      scheduledAppointments: scheduledCount,
      completedAppointments: completedCount,
      cancelledAppointments: cancelledCount,
    };
  }
}
