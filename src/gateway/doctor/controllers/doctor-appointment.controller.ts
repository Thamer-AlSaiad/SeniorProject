import {
  Controller,
  Get,
  Post,
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
import { AppointmentService } from '../../../core/services/scheduling/appointment.service';
import { AppointmentQueryDto, CancelAppointmentDto } from '../dto/appointment.dto';
import { ApiResponse, RequestUser, AppointmentStatus } from '../../../common/types';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

@Controller('doctor/appointments')
@UseGuards(DoctorJwtGuard)
export class DoctorAppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  async findAll(
    @Query() query: AppointmentQueryDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const result = await this.appointmentService.findByDoctor(
      user.userId,
      user.organizationId || DEFAULT_ORG_ID,
      {
        patientId: query.patientId,
        status: query.status,
        fromDate: query.startDate ? new Date(query.startDate) : undefined,
        toDate: query.endDate ? new Date(query.endDate) : undefined,
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
      message: 'Appointments retrieved successfully',
      data: result,
    };
  }

  @Get('today')
  async findToday(
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await this.appointmentService.findByDoctor(
      user.userId,
      user.organizationId || DEFAULT_ORG_ID,
      {
        fromDate: today,
        toDate: tomorrow,
      },
      {
        page: 1,
        limit: 100,
        sortBy: 'startTime',
        sortOrder: 'ASC',
      },
    );
    return {
      success: true,
      message: "Today's appointments retrieved successfully",
      data: result,
    };
  }


  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const appointment = await this.appointmentService.findById(id);
    return {
      success: true,
      message: 'Appointment retrieved successfully',
      data: appointment,
    };
  }

  @Post(':id/check-in')
  @HttpCode(HttpStatus.OK)
  async checkIn(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const appointment = await this.appointmentService.checkIn(id, user);
    return {
      success: true,
      message: 'Patient checked in successfully',
      data: appointment,
    };
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async startVisit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const appointment = await this.appointmentService.startVisit(
      id,
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Visit started successfully',
      data: appointment,
    };
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const appointment = await this.appointmentService.complete(id, user);
    return {
      success: true,
      message: 'Appointment completed successfully',
      data: appointment,
    };
  }

  @Post(':id/no-show')
  @HttpCode(HttpStatus.OK)
  async markNoShow(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const appointment = await this.appointmentService.markNoShow(id, user);
    return {
      success: true,
      message: 'Appointment marked as no-show',
      data: appointment,
    };
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelAppointmentDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const appointment = await this.appointmentService.cancel(id, dto, user);
    return {
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment,
    };
  }
}
