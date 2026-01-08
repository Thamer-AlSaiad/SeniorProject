import {
  Controller,
  Get,
  Post,
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
import { VitalSignService } from '../../../core/services/clinical/vital-sign.service';
import { CreateVitalSignDto, CreateBulkVitalSignsDto, VitalSignQueryDto } from '../dto/vital-sign.dto';
import { ApiResponse, RequestUser, VitalSignType } from '../../../common/types';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

@Controller('doctor/vital-signs')
@UseGuards(DoctorJwtGuard)
export class VitalSignController {
  constructor(private readonly vitalSignService: VitalSignService) {}

  @Post()
  async create(
    @Body() dto: CreateVitalSignDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const vitalSign = await this.vitalSignService.create(
      {
        ...dto,
        recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : undefined,
      },
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Vital sign recorded successfully',
      data: vitalSign,
    };
  }

  @Post('bulk')
  async createBulk(
    @Body() dto: CreateBulkVitalSignsDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const vitalSigns = await this.vitalSignService.createBulk(
      dto,
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Vital signs recorded successfully',
      data: vitalSigns,
    };
  }

  @Get()
  async findAll(
    @Query() query: VitalSignQueryDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const result = await this.vitalSignService.findAll(
      user.organizationId || DEFAULT_ORG_ID,
      {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
      query.patientId,
      query.encounterId,
    );
    return {
      success: true,
      message: 'Vital signs retrieved successfully',
      data: result,
    };
  }

  @Get('patient/:patientId')
  async findByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const vitalSigns = await this.vitalSignService.findByPatient(
      patientId,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Patient vital signs retrieved successfully',
      data: vitalSigns,
    };
  }

  @Get('patient/:patientId/latest')
  async findLatestAll(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const vitalSigns = await this.vitalSignService.findLatestAll(
      patientId,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Latest vital signs retrieved successfully',
      data: vitalSigns,
    };
  }

  @Get('patient/:patientId/latest/:type')
  async findLatestByType(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Param('type') type: VitalSignType,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const vitalSign = await this.vitalSignService.findLatestByType(
      patientId,
      user.organizationId || DEFAULT_ORG_ID,
      type,
    );
    return {
      success: true,
      message: 'Latest vital sign retrieved successfully',
      data: vitalSign,
    };
  }

  @Get('encounter/:encounterId')
  async findByEncounter(
    @Param('encounterId', ParseUUIDPipe) encounterId: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const vitalSigns = await this.vitalSignService.findByEncounter(
      encounterId,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Encounter vital signs retrieved successfully',
      data: vitalSigns,
    };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const vitalSign = await this.vitalSignService.findById(
      id,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Vital sign retrieved successfully',
      data: vitalSign,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    await this.vitalSignService.delete(id, user, user.organizationId || DEFAULT_ORG_ID);
    return {
      success: true,
      message: 'Vital sign deleted successfully',
    };
  }
}
