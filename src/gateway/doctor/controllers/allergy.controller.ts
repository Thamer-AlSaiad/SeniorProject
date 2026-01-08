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
import { AllergyService } from '../../../core/services/clinical/allergy.service';
import { CreateAllergyDto, UpdateAllergyDto, AllergyQueryDto } from '../dto/allergy.dto';
import { ApiResponse, RequestUser } from '../../../common/types';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

@Controller('doctor/allergies')
@UseGuards(DoctorJwtGuard)
export class AllergyController {
  constructor(private readonly allergyService: AllergyService) {}

  @Post()
  async create(
    @Body() dto: CreateAllergyDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const allergy = await this.allergyService.create(
      {
        ...dto,
        onsetDate: dto.onsetDate ? new Date(dto.onsetDate) : undefined,
      },
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Allergy created successfully',
      data: allergy,
    };
  }

  @Get()
  async findAll(
    @Query() query: AllergyQueryDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const result = await this.allergyService.findAll(
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
      message: 'Allergies retrieved successfully',
      data: result,
    };
  }

  @Get('patient/:patientId')
  async findByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query('activeOnly') activeOnly: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const allergies = await this.allergyService.findByPatient(
      patientId,
      user.organizationId || DEFAULT_ORG_ID,
      activeOnly !== 'false',
    );
    return {
      success: true,
      message: 'Patient allergies retrieved successfully',
      data: allergies,
    };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const allergy = await this.allergyService.findById(
      id,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Allergy retrieved successfully',
      data: allergy,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAllergyDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const allergy = await this.allergyService.update(
      id,
      {
        ...dto,
        onsetDate: dto.onsetDate ? new Date(dto.onsetDate) : undefined,
      },
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Allergy updated successfully',
      data: allergy,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    await this.allergyService.delete(id, user, user.organizationId || DEFAULT_ORG_ID);
    return {
      success: true,
      message: 'Allergy deleted successfully',
    };
  }
}
