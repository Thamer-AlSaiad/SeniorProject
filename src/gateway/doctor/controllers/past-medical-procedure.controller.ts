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
import { PastMedicalProcedureService } from '../../../core/services/clinical/past-medical-procedure.service';
import {
  CreatePastMedicalProcedureDto,
  UpdatePastMedicalProcedureDto,
  PastMedicalProcedureQueryDto,
} from '../dto/past-medical-procedure.dto';
import { ApiResponse, RequestUser } from '../../../common/types';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

@Controller('doctor/past-medical-procedures')
@UseGuards(DoctorJwtGuard)
export class PastMedicalProcedureController {
  constructor(private readonly procedureService: PastMedicalProcedureService) {}

  @Post()
  async create(
    @Body() dto: CreatePastMedicalProcedureDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const procedure = await this.procedureService.create(
      {
        ...dto,
        procedureDate: dto.procedureDate ? new Date(dto.procedureDate) : undefined,
      },
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Past medical procedure created successfully',
      data: procedure,
    };
  }

  @Get()
  async findAll(
    @Query() query: PastMedicalProcedureQueryDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const result = await this.procedureService.findAll(
      user.organizationId || DEFAULT_ORG_ID,
      {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
      query.patientId,
    );
    return {
      success: true,
      message: 'Past medical procedures retrieved successfully',
      data: result,
    };
  }

  @Get('patient/:patientId')
  async findByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const procedures = await this.procedureService.findByPatient(
      patientId,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Patient past medical procedures retrieved successfully',
      data: procedures,
    };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const procedure = await this.procedureService.findById(
      id,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Past medical procedure retrieved successfully',
      data: procedure,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePastMedicalProcedureDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const procedure = await this.procedureService.update(
      id,
      {
        ...dto,
        procedureDate: dto.procedureDate ? new Date(dto.procedureDate) : undefined,
      },
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Past medical procedure updated successfully',
      data: procedure,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    await this.procedureService.delete(id, user, user.organizationId || DEFAULT_ORG_ID);
    return {
      success: true,
      message: 'Past medical procedure deleted successfully',
    };
  }
}
