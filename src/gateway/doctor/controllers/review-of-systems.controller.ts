import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DoctorJwtGuard } from '../guards/doctor-jwt.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ReviewOfSystemsService } from '../../../core/services/clinical/review-of-systems.service';
import {
  CreateReviewOfSystemsDto,
  CreateBulkReviewOfSystemsDto,
  UpdateReviewOfSystemsDto,
} from '../dto/review-of-systems.dto';
import { ApiResponse, RequestUser, ReviewOfSystemsCategory } from '../../../common/types';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

@Controller('doctor/review-of-systems')
@UseGuards(DoctorJwtGuard)
export class ReviewOfSystemsController {
  constructor(private readonly reviewOfSystemsService: ReviewOfSystemsService) {}

  @Post()
  async create(
    @Body() dto: CreateReviewOfSystemsDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const review = await this.reviewOfSystemsService.create(
      dto,
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Review of systems created successfully',
      data: review,
    };
  }

  @Post('bulk')
  async createBulk(
    @Body() dto: CreateBulkReviewOfSystemsDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const reviews = await this.reviewOfSystemsService.createBulk(
      dto,
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Review of systems created successfully',
      data: reviews,
    };
  }

  @Get('patient/:patientId')
  async findByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const reviews = await this.reviewOfSystemsService.findByPatient(
      patientId,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Patient review of systems retrieved successfully',
      data: reviews,
    };
  }

  @Get('patient/:patientId/category/:category')
  async findByCategory(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Param('category') category: ReviewOfSystemsCategory,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const reviews = await this.reviewOfSystemsService.findByCategory(
      patientId,
      user.organizationId || DEFAULT_ORG_ID,
      category,
    );
    return {
      success: true,
      message: 'Review of systems by category retrieved successfully',
      data: reviews,
    };
  }

  @Get('encounter/:encounterId')
  async findByEncounter(
    @Param('encounterId', ParseUUIDPipe) encounterId: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const reviews = await this.reviewOfSystemsService.findByEncounter(
      encounterId,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Encounter review of systems retrieved successfully',
      data: reviews,
    };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const review = await this.reviewOfSystemsService.findById(
      id,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Review of systems retrieved successfully',
      data: review,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewOfSystemsDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const review = await this.reviewOfSystemsService.update(
      id,
      dto,
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Review of systems updated successfully',
      data: review,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    await this.reviewOfSystemsService.delete(id, user, user.organizationId || DEFAULT_ORG_ID);
    return {
      success: true,
      message: 'Review of systems deleted successfully',
    };
  }
}
