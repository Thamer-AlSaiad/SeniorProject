import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { AppointmentEntity } from '../entities/appointment.entity';
import { AppointmentStatus, PaginationParams, PaginatedResponse } from '../../common/types';

export interface AppointmentFilters {
  organizationId?: string;
  patientId?: string;
  doctorId?: string;
  status?: AppointmentStatus | AppointmentStatus[];
  fromDate?: Date;
  toDate?: Date;
  search?: string;
}

@Injectable()
export class AppointmentRepository {
  constructor(
    @InjectRepository(AppointmentEntity)
    private readonly repository: Repository<AppointmentEntity>,
  ) {}

  async create(data: Partial<AppointmentEntity>): Promise<AppointmentEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<AppointmentEntity | null> {
    return this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['patient', 'doctor', 'organization', 'timeSlot', 'encounter'],
    });
  }

  async findByIdWithOrg(id: string, organizationId: string): Promise<AppointmentEntity | null> {
    return this.repository.findOne({
      where: { id, organizationId, deletedAt: IsNull() },
      relations: ['patient', 'doctor', 'organization', 'timeSlot', 'encounter'],
    });
  }

  async findByPatient(
    patientId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<AppointmentEntity>> {
    const { page = 1, limit = 20, sortBy = 'appointmentDate', sortOrder = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.organization', 'organization')
      .leftJoinAndSelect('appointment.timeSlot', 'timeSlot')
      .where('appointment.patientId = :patientId', { patientId })
      .andWhere('appointment.deletedAt IS NULL')
      .orderBy(`appointment.${sortBy}`, sortOrder)
      .addOrderBy('appointment.startTime', sortOrder)
      .skip(skip)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByDoctor(
    doctorId: string,
    organizationId: string,
    filters: AppointmentFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<AppointmentEntity>> {
    const { page = 1, limit = 20, sortBy = 'appointmentDate', sortOrder = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.organization', 'organization')
      .leftJoinAndSelect('appointment.timeSlot', 'timeSlot')
      .leftJoinAndSelect('appointment.encounter', 'encounter')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('appointment.organizationId = :organizationId', { organizationId })
      .andWhere('appointment.deletedAt IS NULL');

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        queryBuilder.andWhere('appointment.status IN (:...statuses)', { statuses: filters.status });
      } else {
        queryBuilder.andWhere('appointment.status = :status', { status: filters.status });
      }
    }

    if (filters.fromDate) {
      queryBuilder.andWhere('appointment.appointmentDate >= :fromDate', { fromDate: filters.fromDate });
    }

    if (filters.toDate) {
      queryBuilder.andWhere('appointment.appointmentDate <= :toDate', { toDate: filters.toDate });
    }

    if (filters.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(patient.firstName) LIKE :search OR LOWER(patient.lastName) LIKE :search OR LOWER(appointment.reasonForVisit) LIKE :search)',
        { search: searchTerm },
      );
    }

    queryBuilder
      .orderBy(`appointment.${sortBy}`, sortOrder)
      .addOrderBy('appointment.startTime', sortOrder)
      .skip(skip)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
    additionalData?: Partial<AppointmentEntity>,
  ): Promise<AppointmentEntity | null> {
    const updateData: Partial<AppointmentEntity> = { status, ...additionalData };
    await this.repository.update({ id, deletedAt: IsNull() }, updateData);
    return this.findById(id);
  }

  async update(id: string, data: Partial<AppointmentEntity>): Promise<AppointmentEntity | null> {
    await this.repository.update({ id, deletedAt: IsNull() }, data);
    return this.findById(id);
  }

  async softDelete(id: string, deletedBy?: string): Promise<void> {
    await this.repository.update(
      { id },
      { deletedAt: new Date() },
    );
  }

  async findByTimeSlotId(timeSlotId: string): Promise<AppointmentEntity | null> {
    return this.repository.findOne({
      where: { timeSlotId, deletedAt: IsNull() },
      relations: ['patient', 'doctor'],
    });
  }

  async findUpcomingByPatient(patientId: string, fromDate: Date): Promise<AppointmentEntity[]> {
    return this.repository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.organization', 'organization')
      .where('appointment.patientId = :patientId', { patientId })
      .andWhere('appointment.appointmentDate >= :fromDate', { fromDate })
      .andWhere('appointment.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW],
      })
      .andWhere('appointment.deletedAt IS NULL')
      .orderBy('appointment.appointmentDate', 'ASC')
      .addOrderBy('appointment.startTime', 'ASC')
      .getMany();
  }

  async findUpcomingByDoctor(
    doctorId: string,
    organizationId: string,
    fromDate: Date,
  ): Promise<AppointmentEntity[]> {
    return this.repository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('appointment.organizationId = :organizationId', { organizationId })
      .andWhere('appointment.appointmentDate >= :fromDate', { fromDate })
      .andWhere('appointment.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW],
      })
      .andWhere('appointment.deletedAt IS NULL')
      .orderBy('appointment.appointmentDate', 'ASC')
      .addOrderBy('appointment.startTime', 'ASC')
      .getMany();
  }

  async countByDoctorAndStatus(
    doctorId: string,
    organizationId: string,
    status: AppointmentStatus,
  ): Promise<number> {
    return this.repository.count({
      where: { doctorId, organizationId, status, deletedAt: IsNull() },
    });
  }

  async findByDateRange(
    doctorId: string,
    organizationId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<AppointmentEntity[]> {
    return this.repository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.timeSlot', 'timeSlot')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('appointment.organizationId = :organizationId', { organizationId })
      .andWhere('appointment.appointmentDate >= :fromDate', { fromDate })
      .andWhere('appointment.appointmentDate <= :toDate', { toDate })
      .andWhere('appointment.deletedAt IS NULL')
      .orderBy('appointment.appointmentDate', 'ASC')
      .addOrderBy('appointment.startTime', 'ASC')
      .getMany();
  }

  async countByOrganizationAndStatus(
    organizationId: string,
    status: AppointmentStatus,
  ): Promise<number> {
    return this.repository.count({
      where: { organizationId, status, deletedAt: IsNull() },
    });
  }
}
