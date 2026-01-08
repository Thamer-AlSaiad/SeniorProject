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
import { ScheduleExceptionService } from '../../../core/services/scheduling/schedule-exception.service';
import { CreateScheduleExceptionDto } from '../dto/schedule.dto';
import { ApiResponse, RequestUser } from '../../../common/types';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

@Controller('doctor/schedule-exceptions')
@UseGuards(DoctorJwtGuard)
export class ScheduleExceptionController {
  constructor(
    private readonly scheduleExceptionService: ScheduleExceptionService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateScheduleExceptionDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const result = await this.scheduleExceptionService.create(
      {
        exceptionDate: new Date(dto.exceptionDate),
        startTime: dto.startTime,
        endTime: dto.endTime,
        reason: dto.reason,
      },
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Schedule exception created successfully',
      data: {
        exception: result.exception,
        affectedAppointments: result.affectedAppointments,
      },
    };
  }

  @Get()
  async findAll(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    let exceptions;
    if (fromDate && toDate) {
      exceptions = await this.scheduleExceptionService.findByDateRange(
        user.userId,
        user.organizationId || DEFAULT_ORG_ID,
        new Date(fromDate),
        new Date(toDate),
      );
    } else {
      exceptions = await this.scheduleExceptionService.findByDoctor(
        user.userId,
        user.organizationId || DEFAULT_ORG_ID,
      );
    }
    return {
      success: true,
      message: 'Schedule exceptions retrieved successfully',
      data: exceptions,
    };
  }

  @Get('upcoming')
  async findUpcoming(
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const exceptions = await this.scheduleExceptionService.findUpcoming(
      user.userId,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Upcoming schedule exceptions retrieved successfully',
      data: exceptions,
    };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const exception = await this.scheduleExceptionService.findById(
      id,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Schedule exception retrieved successfully',
      data: exception,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    await this.scheduleExceptionService.delete(
      id,
      user,
      user.organizationId || DEFAULT_ORG_ID,
    );
    return {
      success: true,
      message: 'Schedule exception deleted successfully',
    };
  }
}
