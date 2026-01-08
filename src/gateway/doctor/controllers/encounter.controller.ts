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
import { EncounterService } from '../../../core/services/clinical/encounter.service';
import { CreateEncounterDto, UpdateEncounterDto, EncounterQueryDto } from '../dto/encounter.dto';
import { ApiResponse, RequestUser } from '../../../common/types';

// TODO: Replace with actual organization resolution from user context
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

@Controller('doctor/encounters')
@UseGuards(DoctorJwtGuard)
export class EncounterController {
  constructor(private readonly encounterService: EncounterService) {}

  @Post()
  async create(
    @Body() dto: CreateEncounterDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const encounter = await this.encounterService.create(
      {
        ...dto,
        encounterDate: new Date(dto.encounterDate),
      },
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Encounter created successfully',
      data: encounter,
    };
  }

  @Get()
  async findAll(
    @Query() query: EncounterQueryDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const result = await this.encounterService.findAll(
      user.organizationId || DEFAULT_ORG_ID,
      {
        patientId: query.patientId,
        doctorId: query.doctorId,
        status: query.status,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        search: query.search,
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
      message: 'Encounters retrieved successfully',
      data: result,
    };
  }

  @Get('active')
  async findActive(@CurrentUser() user: RequestUser): Promise<ApiResponse> {
    const encounters = await this.encounterService.findActiveByDoctor(
      user.userId,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Active encounters retrieved successfully',
      data: encounters,
    };
  }

  @Get('patient/:patientId')
  async findByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const encounters = await this.encounterService.findByPatient(
      patientId,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Patient encounters retrieved successfully',
      data: encounters,
    };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const encounter = await this.encounterService.findById(
      id,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Encounter retrieved successfully',
      data: encounter,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEncounterDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const encounter = await this.encounterService.update(
      id,
      {
        ...dto,
        encounterDate: dto.encounterDate ? new Date(dto.encounterDate) : undefined,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      },
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Encounter updated successfully',
      data: encounter,
    };
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async start(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const encounter = await this.encounterService.startEncounter(
      id,
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Encounter started successfully',
      data: encounter,
    };
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const encounter = await this.encounterService.completeEncounter(
      id,
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Encounter completed successfully',
      data: encounter,
    };
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const encounter = await this.encounterService.cancelEncounter(
      id,
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Encounter cancelled successfully',
      data: encounter,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    await this.encounterService.delete(id, user, user.organizationId || DEFAULT_ORG_ID);
    return {
      success: true,
      message: 'Encounter deleted successfully',
    };
  }
}
