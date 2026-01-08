import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DoctorJwtGuard } from '../guards/doctor-jwt.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { MedicalRecordService } from '../../../core/services/clinical/medical-record.service';
import {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  UpdateMedicalRecordFieldDto,
  MedicalRecordQueryDto,
} from '../dto/medical-record.dto';
import { ApiResponse, RequestUser } from '../../../common/types';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

@Controller('doctor/medical-records')
@UseGuards(DoctorJwtGuard)
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Post()
  async create(
    @Body() dto: CreateMedicalRecordDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const record = await this.medicalRecordService.create(
      dto,
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Medical record created successfully',
      data: record,
    };
  }

  @Get()
  async findAll(
    @Query() query: MedicalRecordQueryDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const result = await this.medicalRecordService.findAll(
      user.organizationId || DEFAULT_ORG_ID,
      {
        patientId: query.patientId,
        doctorId: query.doctorId,
        encounterId: query.encounterId,
        isFinalized: query.isFinalized,
      },
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

  @Get('patient/:patientId')
  async findByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const records = await this.medicalRecordService.findByPatient(
      patientId,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Patient medical records retrieved successfully',
      data: records,
    };
  }

  @Get('encounter/:encounterId')
  async findByEncounter(
    @Param('encounterId', ParseUUIDPipe) encounterId: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const record = await this.medicalRecordService.findByEncounter(
      encounterId,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Medical record retrieved successfully',
      data: record,
    };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const record = await this.medicalRecordService.findById(
      id,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Medical record retrieved successfully',
      data: record,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMedicalRecordDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const record = await this.medicalRecordService.update(
      id,
      dto,
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Medical record updated successfully',
      data: record,
    };
  }

  @Put(':id/field')
  async updateField(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMedicalRecordFieldDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const record = await this.medicalRecordService.updateField(
      id,
      dto.field,
      dto.value,
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Medical record field updated successfully',
      data: record,
    };
  }

  @Post(':id/finalize')
  @HttpCode(HttpStatus.OK)
  async finalize(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const record = await this.medicalRecordService.finalize(
      id,
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Medical record finalized successfully',
      data: record,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    await this.medicalRecordService.delete(id, user, user.organizationId || DEFAULT_ORG_ID);
    return {
      success: true,
      message: 'Medical record deleted successfully',
    };
  }
}
