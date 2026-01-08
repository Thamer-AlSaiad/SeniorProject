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
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { DoctorManagementService } from '../../../core/services/admin/doctor-management.service';
import {
  CreateDoctorDto,
  UpdateDoctorDto,
  DoctorQueryDto,
  AssignOrganizationDto,
  RemoveOrganizationDto,
} from '../dto/doctor-management.dto';
import { ApiResponse, RequestUser } from '../../../common/types';

@Controller('admin/doctors')
@UseGuards(AdminJwtGuard)
export class DoctorManagementController {
  constructor(private readonly doctorManagementService: DoctorManagementService) {}

  /**
   * Create a new doctor account.
   * POST /admin/doctors
   * Requirements: 7.3, 7.4, 8.1
   */
  @Post()
  async create(
    @Body() dto: CreateDoctorDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const doctor = await this.doctorManagementService.create(dto, user);
    return {
      success: true,
      message: 'Doctor created successfully',
      data: doctor,
    };
  }

  /**
   * Get all doctors with pagination and filters.
   * GET /admin/doctors
   * Requirements: 7.1, 7.2
   */
  @Get()
  async findAll(
    @Query() query: DoctorQueryDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const { search, organizationId, accountStatus, specialization, page = 1, limit = 20, sortBy, sortOrder } = query;
    const result = await this.doctorManagementService.findAll(
      { page, limit, sortBy, sortOrder },
      { search, organizationId, accountStatus, specialization },
    );
    return {
      success: true,
      message: 'Doctors retrieved successfully',
      data: result,
    };
  }


  /**
   * Get doctor by ID.
   * GET /admin/doctors/:id
   * Requirements: 7.7
   */
  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const doctor = await this.doctorManagementService.findById(id);
    return {
      success: true,
      message: 'Doctor retrieved successfully',
      data: doctor,
    };
  }

  /**
   * Update doctor information.
   * PUT /admin/doctors/:id
   * Requirements: 7.5
   */
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDoctorDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const doctor = await this.doctorManagementService.update(id, dto, user);
    return {
      success: true,
      message: 'Doctor updated successfully',
      data: doctor,
    };
  }

  /**
   * Delete a doctor account.
   * DELETE /admin/doctors/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    await this.doctorManagementService.delete(id, user);
    return {
      success: true,
      message: 'Doctor deleted successfully',
    };
  }

  /**
   * Suspend a doctor account.
   * POST /admin/doctors/:id/suspend
   * Requirements: 7.6
   */
  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  async suspend(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const doctor = await this.doctorManagementService.suspend(id, user);
    return {
      success: true,
      message: 'Doctor suspended successfully',
      data: doctor,
    };
  }

  /**
   * Activate a doctor account.
   * POST /admin/doctors/:id/activate
   * Requirements: 7.5
   */
  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const doctor = await this.doctorManagementService.activate(id, user);
    return {
      success: true,
      message: 'Doctor activated successfully',
      data: doctor,
    };
  }

  /**
   * Assign doctor to an organization.
   * POST /admin/doctors/:id/assign-org
   * Requirements: 8.1
   */
  @Post(':id/assign-org')
  @HttpCode(HttpStatus.OK)
  async assignToOrganization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignOrganizationDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    await this.doctorManagementService.assignToOrganization(
      id,
      dto.organizationId,
      dto.isPrimary ?? false,
    );
    return {
      success: true,
      message: 'Doctor assigned to organization successfully',
    };
  }

  /**
   * Remove doctor from an organization.
   * POST /admin/doctors/:id/remove-org
   * Requirements: 8.3
   */
  @Post(':id/remove-org')
  @HttpCode(HttpStatus.OK)
  async removeFromOrganization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RemoveOrganizationDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    await this.doctorManagementService.removeFromOrganization(id, dto.organizationId);
    return {
      success: true,
      message: 'Doctor removed from organization successfully',
    };
  }
}
