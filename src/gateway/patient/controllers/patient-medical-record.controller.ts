import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PatientJwtGuard } from '../guards/patient-jwt.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PatientMedicalRecordService } from '../../../core/services/patient/patient-medical-record.service';
import { MedicalRecordQueryDto } from '../dto/booking.dto';
import { ApiResponse, RequestUser } from '../../../common/types';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Controller for patient access to their medical records.
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
@Controller('patient')
@UseGuards(PatientJwtGuard)
export class PatientMedicalRecordController {
  constructor(
    private readonly patientMedicalRecordService: PatientMedicalRecordService,
  ) {}

  /**
   * Get patient's medical records (finalized only).
   * Requirements: 5.1, 5.2, 5.3, 5.4
   */
  @Get('medical-records')
  async getMedicalRecords(
    @Query() query: MedicalRecordQueryDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const organizationId = user.organizationId || DEFAULT_ORG_ID;
    
    const result = await this.patientMedicalRecordService.findMedicalRecords(
      user.userId,
      organizationId,
      {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
    );

    return {
      success: true,
      message: 'Medical records retrieved successfully',
      data: result,
    };
  }

  /**
   * Get a specific medical record by ID.
   * Requirements: 5.2, 5.3, 5.4
   */
  @Get('medical-records/:id')
  async getMedicalRecordById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const organizationId = user.organizationId || DEFAULT_ORG_ID;
    
    const record = await this.patientMedicalRecordService.findMedicalRecord(
      id,
      user.userId,
      organizationId,
    );

    return {
      success: true,
      message: 'Medical record retrieved successfully',
      data: record,
    };
  }

  /**
   * Get patient's allergies.
   * Requirements: 5.5
   */
  @Get('allergies')
  async getAllergies(
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const organizationId = user.organizationId || DEFAULT_ORG_ID;
    
    const allergies = await this.patientMedicalRecordService.findAllergies(
      user.userId,
      organizationId,
    );

    return {
      success: true,
      message: 'Allergies retrieved successfully',
      data: allergies,
    };
  }

  /**
   * Get patient's encounters (completed visits).
   * Requirements: 5.1
   */
  @Get('encounters')
  async getEncounters(
    @Query() query: MedicalRecordQueryDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const organizationId = user.organizationId || DEFAULT_ORG_ID;
    
    const result = await this.patientMedicalRecordService.findEncounters(
      user.userId,
      organizationId,
      {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
    );

    return {
      success: true,
      message: 'Encounters retrieved successfully',
      data: result,
    };
  }
}
