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
import { ScheduleService } from '../../../core/services/scheduling/schedule.service';
import { TimeSlotService } from '../../../core/services/scheduling/time-slot.service';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  GenerateSlotsDto,
  ScheduleQueryDto,
} from '../dto/schedule.dto';
import { ApiResponse, RequestUser } from '../../../common/types';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

@Controller('doctor/schedules')
@UseGuards(DoctorJwtGuard)
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly timeSlotService: TimeSlotService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateScheduleDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    // Use doctor's organization from JWT, fail if not assigned
    const organizationId = user.organizationId;
    if (!organizationId) {
      return {
        success: false,
        message: 'Doctor must be assigned to an organization to create schedules',
      };
    }

    const schedule = await this.scheduleService.create(
      {
        ...dto,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
        effectiveUntil: dto.effectiveUntil ? new Date(dto.effectiveUntil) : undefined,
      },
      user,
      organizationId,
    );
    return {
      success: true,
      message: 'Schedule created successfully',
      data: schedule,
    };
  }

  @Get()
  async findAll(
    @Query() query: ScheduleQueryDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const organizationId = user.organizationId;
    if (!organizationId) {
      return {
        success: true,
        message: 'No organization assigned',
        data: [],
      };
    }
    const schedules = query.activeOnly
      ? await this.scheduleService.findActiveByDoctor(user.userId, organizationId)
      : await this.scheduleService.findByDoctor(user.userId, organizationId);
    return {
      success: true,
      message: 'Schedules retrieved successfully',
      data: schedules,
    };
  }


  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const organizationId = user.organizationId;
    if (!organizationId) {
      return {
        success: false,
        message: 'No organization assigned',
      };
    }
    const schedule = await this.scheduleService.findById(id, organizationId);
    return {
      success: true,
      message: 'Schedule retrieved successfully',
      data: schedule,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScheduleDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const organizationId = user.organizationId;
    if (!organizationId) {
      return {
        success: false,
        message: 'No organization assigned',
      };
    }
    const schedule = await this.scheduleService.update(
      id,
      {
        ...dto,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
        effectiveUntil: dto.effectiveUntil ? new Date(dto.effectiveUntil) : undefined,
      },
      user,
      organizationId,
    );
    return {
      success: true,
      message: 'Schedule updated successfully',
      data: schedule,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const organizationId = user.organizationId;
    if (!organizationId) {
      return {
        success: false,
        message: 'No organization assigned',
      };
    }
    await this.scheduleService.delete(id, user, organizationId);
    return {
      success: true,
      message: 'Schedule deleted successfully',
    };
  }

  @Post(':id/generate-slots')
  @HttpCode(HttpStatus.OK)
  async generateSlots(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GenerateSlotsDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const organizationId = user.organizationId;
    if (!organizationId) {
      return {
        success: false,
        message: 'No organization assigned',
      };
    }
    const slots = await this.timeSlotService.generateSlots(
      id,
      organizationId,
      new Date(dto.fromDate),
      new Date(dto.toDate),
    );
    return {
      success: true,
      message: `Generated ${slots.length} time slots`,
      data: slots,
    };
  }
}
