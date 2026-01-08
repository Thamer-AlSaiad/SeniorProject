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
import { OrganizationService } from '../../../core/services/admin/organization.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationQueryDto,
} from '../dto/organization.dto';
import { ApiResponse, RequestUser } from '../../../common/types';

@Controller('admin/organizations')
@UseGuards(AdminJwtGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  /**
   * Create a new organization.
   * POST /admin/organizations
   * Requirements: 6.3
   */
  @Post()
  async create(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const organization = await this.organizationService.create(dto, user);
    return {
      success: true,
      message: 'Organization created successfully',
      data: organization,
    };
  }

  /**
   * Get all organizations with pagination and search.
   * GET /admin/organizations
   * Requirements: 6.1, 6.2
   */
  @Get()
  async findAll(
    @Query() query: OrganizationQueryDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const { search, page = 1, limit = 20, sortBy, sortOrder } = query;
    const result = await this.organizationService.findAll(
      { page, limit, sortBy, sortOrder },
      search,
    );
    return {
      success: true,
      message: 'Organizations retrieved successfully',
      data: result,
    };
  }


  /**
   * Get organization by ID.
   * GET /admin/organizations/:id
   * Requirements: 6.6
   */
  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const organization = await this.organizationService.findById(id);
    return {
      success: true,
      message: 'Organization retrieved successfully',
      data: organization,
    };
  }

  /**
   * Update an organization.
   * PUT /admin/organizations/:id
   * Requirements: 6.4
   */
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const organization = await this.organizationService.update(id, dto, user);
    return {
      success: true,
      message: 'Organization updated successfully',
      data: organization,
    };
  }

  /**
   * Delete an organization.
   * DELETE /admin/organizations/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    await this.organizationService.delete(id, user);
    return {
      success: true,
      message: 'Organization deleted successfully',
    };
  }

  /**
   * Deactivate an organization.
   * POST /admin/organizations/:id/deactivate
   * Requirements: 6.5
   */
  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const organization = await this.organizationService.deactivate(id, user);
    return {
      success: true,
      message: 'Organization deactivated successfully',
      data: organization,
    };
  }

  /**
   * Activate an organization.
   * POST /admin/organizations/:id/activate
   * Requirements: 6.5
   */
  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const organization = await this.organizationService.activate(id, user);
    return {
      success: true,
      message: 'Organization activated successfully',
      data: organization,
    };
  }

  /**
   * Get doctors associated with an organization.
   * GET /admin/organizations/:id/doctors
   * Requirements: 6.6
   */
  @Get(':id/doctors')
  async getDoctors(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const doctors = await this.organizationService.getDoctors(id);
    return {
      success: true,
      message: 'Organization doctors retrieved successfully',
      data: doctors,
    };
  }

  /**
   * Get statistics for an organization.
   * GET /admin/organizations/:id/stats
   * Requirements: 6.6
   */
  @Get(':id/stats')
  async getStatistics(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const stats = await this.organizationService.getStatistics(id);
    return {
      success: true,
      message: 'Organization statistics retrieved successfully',
      data: stats,
    };
  }
}
