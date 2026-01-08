import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { DoctorOrganizationEntity } from '../entities/doctor-organization.entity';

@Injectable()
export class DoctorOrganizationRepository {
  constructor(
    @InjectRepository(DoctorOrganizationEntity)
    private readonly repository: Repository<DoctorOrganizationEntity>,
  ) {}

  async assign(
    doctorId: string,
    organizationId: string,
    isPrimary: boolean = false,
  ): Promise<DoctorOrganizationEntity> {
    // Check if assignment already exists
    const existing = await this.repository.findOne({
      where: { doctorId, organizationId },
    });

    if (existing) {
      // If it was previously removed (leftAt set), reactivate it
      if (existing.leftAt) {
        existing.leftAt = null;
        existing.isPrimary = isPrimary;
        return this.repository.save(existing);
      }
      // Already assigned and active
      return existing;
    }

    // Create new assignment
    const entity = this.repository.create({
      doctorId,
      organizationId,
      isPrimary,
    });
    return this.repository.save(entity);
  }

  async remove(doctorId: string, organizationId: string): Promise<void> {
    await this.repository.update(
      { doctorId, organizationId, leftAt: IsNull() },
      { leftAt: new Date() },
    );
  }

  async findByDoctor(doctorId: string): Promise<DoctorOrganizationEntity[]> {
    return this.repository.find({
      where: { doctorId, leftAt: IsNull() },
      relations: ['organization'],
      order: { isPrimary: 'DESC', joinedAt: 'ASC' },
    });
  }

  async findByOrganization(organizationId: string): Promise<DoctorOrganizationEntity[]> {
    return this.repository.find({
      where: { organizationId, leftAt: IsNull() },
      relations: ['doctor'],
      order: { isPrimary: 'DESC', joinedAt: 'ASC' },
    });
  }

  async findActiveAssignment(
    doctorId: string,
    organizationId: string,
  ): Promise<DoctorOrganizationEntity | null> {
    return this.repository.findOne({
      where: { doctorId, organizationId, leftAt: IsNull() },
      relations: ['doctor', 'organization'],
    });
  }

  async setPrimary(doctorId: string, organizationId: string): Promise<void> {
    // First, unset all primary flags for this doctor
    await this.repository.update(
      { doctorId, leftAt: IsNull() },
      { isPrimary: false },
    );
    // Then set the specified organization as primary
    await this.repository.update(
      { doctorId, organizationId, leftAt: IsNull() },
      { isPrimary: true },
    );
  }

  async getPrimaryOrganization(doctorId: string): Promise<DoctorOrganizationEntity | null> {
    return this.repository.findOne({
      where: { doctorId, isPrimary: true, leftAt: IsNull() },
      relations: ['organization'],
    });
  }

  async countByDoctor(doctorId: string): Promise<number> {
    return this.repository.count({
      where: { doctorId, leftAt: IsNull() },
    });
  }

  async countByOrganization(organizationId: string): Promise<number> {
    return this.repository.count({
      where: { organizationId, leftAt: IsNull() },
    });
  }

  async isDoctorInOrganization(doctorId: string, organizationId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { doctorId, organizationId, leftAt: IsNull() },
    });
    return count > 0;
  }

  async findAllByDoctor(doctorId: string): Promise<DoctorOrganizationEntity[]> {
    // Include historical assignments (with leftAt set)
    return this.repository.find({
      where: { doctorId },
      relations: ['organization'],
      order: { leftAt: 'ASC', joinedAt: 'DESC' },
    });
  }
}
