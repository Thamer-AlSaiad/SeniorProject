import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DoctorRepository } from '../../../repos/repositories/doctor.repository';
import { DoctorOrganizationRepository } from '../../../repos/repositories/doctor-organization.repository';
import { OrganizationRepository } from '../../../repos/repositories/organization.repository';
import { AppointmentRepository } from '../../../repos/repositories/appointment.repository';
import { DoctorEntity } from '../../../repos/entities/doctor.entity';
import { EmailService } from '../email/email.service';
import {
  RequestUser,
  PaginationParams,
  PaginatedResponse,
  AccountStatus,
  AppointmentStatus,
  UserType,
} from '../../../common/types';

export interface CreateDoctorDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  specialization?: string;
  licenseNumber?: string;
  phoneNumber?: string;
}

export interface UpdateDoctorDto {
  firstName?: string;
  lastName?: string;
  specialization?: string;
  licenseNumber?: string;
  phoneNumber?: string;
}

export interface DoctorFilters {
  search?: string;
  organizationId?: string;
  accountStatus?: AccountStatus;
  specialization?: string;
}

export interface DoctorWithOrganizations extends DoctorEntity {
  organizations?: Array<{
    id: string;
    name: string;
    isPrimary: boolean;
  }>;
}

@Injectable()
export class DoctorManagementService {
  constructor(
    private readonly doctorRepository: DoctorRepository,
    private readonly doctorOrganizationRepository: DoctorOrganizationRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Generate a temporary password for new doctors.
   */
  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Create a new doctor account.
   * Requirements: 7.3, 7.4, 8.1
   */
  async create(dto: CreateDoctorDto, user: RequestUser): Promise<DoctorEntity> {
    // Validate required fields
    if (!dto.email || dto.email.trim().length === 0) {
      throw new BadRequestException('Email is required');
    }
    if (!dto.firstName || dto.firstName.trim().length === 0) {
      throw new BadRequestException('First name is required');
    }
    if (!dto.lastName || dto.lastName.trim().length === 0) {
      throw new BadRequestException('Last name is required');
    }
    if (!dto.organizationId) {
      throw new BadRequestException('Doctor must be assigned to at least one organization');
    }

    // Check if email already exists
    const existingDoctor = await this.doctorRepository.findByEmail(dto.email.toLowerCase());
    if (existingDoctor) {
      throw new ConflictException('A doctor with this email already exists');
    }

    // Verify organization exists and is active
    const organization = await this.organizationRepository.findById(dto.organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    if (!organization.isActive) {
      throw new BadRequestException('Cannot assign doctor to inactive organization');
    }

    // Use provided password or generate temporary one
    const password = dto.password || this.generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(password, 10);

    // Create doctor
    const doctor = await this.doctorRepository.create({
      email: dto.email.toLowerCase().trim(),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      specialization: dto.specialization?.trim(),
      licenseNumber: dto.licenseNumber?.trim(),
      phoneNumber: dto.phoneNumber?.trim(),
      passwordHash,
      accountStatus: AccountStatus.ACTIVE,
      isEmailVerified: true, // Admin-created accounts are pre-verified
    });

    // Assign to organization
    await this.doctorOrganizationRepository.assign(doctor.id, dto.organizationId, true);

    // Send welcome email with password (only if auto-generated)
    if (!dto.password) {
      try {
        await this.sendWelcomeEmail(doctor, password, organization.name);
      } catch (error) {
        // Log error but don't fail the creation
        console.error('Failed to send welcome email:', error);
      }
    }

    return doctor;
  }

  /**
   * Send welcome email to new doctor with temporary password.
   */
  private async sendWelcomeEmail(
    doctor: DoctorEntity,
    temporaryPassword: string,
    organizationName: string,
  ): Promise<void> {
    // Note: This would typically use a dedicated email template
    // For now, we'll use a simple approach
    console.log(`Welcome email would be sent to ${doctor.email} with temp password: ${temporaryPassword}`);
  }


  /**
   * Find all doctors with pagination and filters.
   * Requirements: 7.1, 7.2
   */
  async findAll(
    pagination: PaginationParams,
    filters?: DoctorFilters,
  ): Promise<PaginatedResponse<DoctorWithOrganizations>> {
    const { page = 1, limit = 20, sortBy = 'lastName', sortOrder = 'ASC' } = pagination;
    const skip = (page - 1) * limit;

    // Build query using repository's underlying repository
    const queryBuilder = (this.doctorRepository as any).repository
      .createQueryBuilder('doctor');

    if (filters?.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(doctor.firstName) LIKE :search OR LOWER(doctor.lastName) LIKE :search OR LOWER(doctor.email) LIKE :search OR LOWER(doctor.specialization) LIKE :search)',
        { search: searchTerm },
      );
    }

    if (filters?.accountStatus) {
      queryBuilder.andWhere('doctor.accountStatus = :status', { status: filters.accountStatus });
    }

    if (filters?.specialization) {
      queryBuilder.andWhere('LOWER(doctor.specialization) = :spec', {
        spec: filters.specialization.toLowerCase(),
      });
    }

    if (filters?.organizationId) {
      queryBuilder
        .innerJoin(
          'doctor_organizations',
          'do',
          'do.doctorId = doctor.id AND do.organizationId = :orgId AND do.leftAt IS NULL',
          { orgId: filters.organizationId },
        );
    }

    queryBuilder
      .orderBy(`doctor.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [doctors, total] = await queryBuilder.getManyAndCount();

    // Fetch organizations for each doctor
    const doctorsWithOrgs: DoctorWithOrganizations[] = await Promise.all(
      doctors.map(async (doctor: DoctorEntity) => {
        const associations = await this.doctorOrganizationRepository.findByDoctor(doctor.id);
        return {
          ...doctor,
          organizations: associations.map((assoc) => ({
            id: assoc.organization.id,
            name: assoc.organization.name,
            isPrimary: assoc.isPrimary,
          })),
        };
      }),
    );

    return {
      items: doctorsWithOrgs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find doctor by ID.
   * Requirements: 7.7
   */
  async findById(id: string): Promise<DoctorWithOrganizations> {
    const doctor = await this.doctorRepository.findById(id);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const associations = await this.doctorOrganizationRepository.findByDoctor(id);
    return {
      ...doctor,
      organizations: associations.map((assoc) => ({
        id: assoc.organization.id,
        name: assoc.organization.name,
        isPrimary: assoc.isPrimary,
      })),
    };
  }

  /**
   * Find doctors by organization.
   * Requirements: 8.2
   */
  async findByOrganization(organizationId: string): Promise<DoctorEntity[]> {
    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const associations = await this.doctorOrganizationRepository.findByOrganization(organizationId);
    return associations.map((assoc) => assoc.doctor);
  }

  /**
   * Update doctor information.
   * Requirements: 7.5
   */
  async update(
    id: string,
    dto: UpdateDoctorDto,
    user: RequestUser,
  ): Promise<DoctorEntity> {
    const doctor = await this.doctorRepository.findById(id);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const updateData: Partial<DoctorEntity> = {};
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName.trim();
    if (dto.specialization !== undefined) updateData.specialization = dto.specialization?.trim();
    if (dto.licenseNumber !== undefined) updateData.licenseNumber = dto.licenseNumber?.trim();
    if (dto.phoneNumber !== undefined) updateData.phoneNumber = dto.phoneNumber?.trim();

    const updated = await this.doctorRepository.update(id, updateData);
    return updated!;
  }

  /**
   * Suspend a doctor account.
   * Requirements: 7.6
   */
  async suspend(id: string, user: RequestUser): Promise<DoctorEntity> {
    const doctor = await this.doctorRepository.findById(id);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (doctor.accountStatus === AccountStatus.SUSPENDED) {
      throw new BadRequestException('Doctor is already suspended');
    }

    // Cancel all future appointments
    await this.cancelFutureAppointments(id);

    const updated = await this.doctorRepository.update(id, {
      accountStatus: AccountStatus.SUSPENDED,
    });
    return updated!;
  }

  /**
   * Cancel all future appointments for a doctor.
   */
  private async cancelFutureAppointments(doctorId: string): Promise<void> {
    const associations = await this.doctorOrganizationRepository.findByDoctor(doctorId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const assoc of associations) {
      const appointments = await this.appointmentRepository.findUpcomingByDoctor(
        doctorId,
        assoc.organizationId,
        today,
      );

      for (const appointment of appointments) {
        await this.appointmentRepository.updateStatus(appointment.id, AppointmentStatus.CANCELLED, {
          cancellationReason: 'Doctor account suspended',
          cancelledAt: new Date(),
        });
      }
    }
  }

  /**
   * Activate a doctor account.
   */
  async activate(id: string, user: RequestUser): Promise<DoctorEntity> {
    const doctor = await this.doctorRepository.findById(id);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (doctor.accountStatus === AccountStatus.ACTIVE) {
      throw new BadRequestException('Doctor is already active');
    }

    // Verify doctor has at least one organization
    const orgCount = await this.doctorOrganizationRepository.countByDoctor(id);
    if (orgCount === 0) {
      throw new BadRequestException('Doctor must be assigned to at least one organization before activation');
    }

    const updated = await this.doctorRepository.update(id, {
      accountStatus: AccountStatus.ACTIVE,
    });
    return updated!;
  }

  /**
   * Assign doctor to an organization.
   * Requirements: 8.1
   */
  async assignToOrganization(
    doctorId: string,
    organizationId: string,
    isPrimary: boolean = false,
  ): Promise<void> {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (!organization.isActive) {
      throw new BadRequestException('Cannot assign doctor to inactive organization');
    }

    await this.doctorOrganizationRepository.assign(doctorId, organizationId, isPrimary);
  }

  /**
   * Remove doctor from an organization.
   * Requirements: 8.3
   */
  async removeFromOrganization(doctorId: string, organizationId: string): Promise<void> {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Check if this is the only organization
    const orgCount = await this.doctorOrganizationRepository.countByDoctor(doctorId);
    if (orgCount <= 1) {
      throw new BadRequestException('Doctor must be assigned to at least one organization');
    }

    // Check if assignment exists
    const assignment = await this.doctorOrganizationRepository.findActiveAssignment(
      doctorId,
      organizationId,
    );
    if (!assignment) {
      throw new NotFoundException('Doctor is not assigned to this organization');
    }

    await this.doctorOrganizationRepository.remove(doctorId, organizationId);
  }

  /**
   * Delete a doctor account permanently.
   */
  async delete(id: string, user: RequestUser): Promise<void> {
    const doctor = await this.doctorRepository.findById(id);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Cancel all future appointments before deletion
    await this.cancelFutureAppointments(id);

    // Remove all organization associations
    const associations = await this.doctorOrganizationRepository.findByDoctor(id);
    for (const assoc of associations) {
      await this.doctorOrganizationRepository.remove(id, assoc.organizationId);
    }

    // Delete the doctor
    await this.doctorRepository.delete(id);
  }

  /**
   * Get doctor statistics.
   * Requirements: 7.7
   */
  async getStatistics(
    doctorId: string,
    organizationId: string,
  ): Promise<{
    scheduledAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
  }> {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const scheduled = await this.appointmentRepository.countByDoctorAndStatus(
      doctorId,
      organizationId,
      AppointmentStatus.SCHEDULED,
    );
    const completed = await this.appointmentRepository.countByDoctorAndStatus(
      doctorId,
      organizationId,
      AppointmentStatus.COMPLETED,
    );
    const cancelled = await this.appointmentRepository.countByDoctorAndStatus(
      doctorId,
      organizationId,
      AppointmentStatus.CANCELLED,
    );
    const noShow = await this.appointmentRepository.countByDoctorAndStatus(
      doctorId,
      organizationId,
      AppointmentStatus.NO_SHOW,
    );

    return {
      scheduledAppointments: scheduled,
      completedAppointments: completed,
      cancelledAppointments: cancelled,
      noShowAppointments: noShow,
    };
  }
}
