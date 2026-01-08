import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorJwtGuard } from '../guards/doctor-jwt.guard';
import { PatientEntity } from '../../../repos/entities/patient.entity';
import { AccountStatus } from '../../../common/types';

@Controller('doctor/patients')
@UseGuards(DoctorJwtGuard)
export class PatientController {
  constructor(
    @InjectRepository(PatientEntity)
    private readonly patientRepository: Repository<PatientEntity>,
  ) {}

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    const queryBuilder = this.patientRepository.createQueryBuilder('patient');
    
    queryBuilder.where('patient.accountStatus = :status', { status: AccountStatus.ACTIVE });
    
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(patient.firstName) LIKE LOWER(:search) OR LOWER(patient.lastName) LIKE LOWER(:search) OR LOWER(patient.email) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }
    
    queryBuilder.orderBy('patient.lastName', 'ASC').addOrderBy('patient.firstName', 'ASC');
    
    const skip = (Number(page) - 1) * Number(limit);
    queryBuilder.skip(skip).take(Number(limit));
    
    const [items, total] = await queryBuilder.getManyAndCount();
    
    return {
      success: true,
      data: {
        items,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const patient = await this.patientRepository.findOne({ where: { id } });
    
    if (!patient) {
      return {
        success: false,
        message: 'Patient not found',
      };
    }
    
    return {
      success: true,
      data: patient,
    };
  }
}
