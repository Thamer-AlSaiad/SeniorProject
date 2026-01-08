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
import { PatientJwtGuard } from '../guards/patient-jwt.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { OrganizationService } from '../../../core/services/admin/organization.service';
import { DoctorManagementService } from '../../../core/services/admin/doctor-management.service';
import { TimeSlotService } from '../../../core/services/scheduling/time-slot.service';
import { AppointmentService } from '../../../core/services/scheduling/appointment.service';
import {
  CreateBookingDto,
  CancelBookingDto,
  AvailableSlotsQueryDto,
  PatientAppointmentQueryDto,
} from '../dto/booking.dto';
import { ApiResponse, RequestUser } from '../../../common/types';

/**
 * Controller for patient appointment booking operations.
 * Requirements: 3.1, 3.2, 3.3, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5
 */
@Controller('patient')
export class PatientBookingController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly doctorManagementService: DoctorManagementService,
    private readonly timeSlotService: TimeSlotService,
    private readonly appointmentService: AppointmentService,
  ) {}

  /**
   * Get list of active clinics/organizations for booking.
   * Requirements: 3.1
   */
  @Get('clinics')
  async getClinics(): Promise<ApiResponse> {
    const clinics = await this.organizationService.findActive();
    return {
      success: true,
      message: 'Clinics retrieved successfully',
      data: clinics,
    };
  }

  /**
   * Get doctors belonging to a specific clinic.
   * Requirements: 3.2
   */
  @Get('clinics/:id/doctors')
  async getClinicDoctors(
    @Param('id', ParseUUIDPipe) clinicId: string,
  ): Promise<ApiResponse> {
    const doctors = await this.doctorManagementService.findByOrganization(clinicId);
    return {
      success: true,
      message: 'Doctors retrieved successfully',
      data: doctors,
    };
  }


  /**
   * Get available time slots for a doctor.
   * Returns slots for the next 30 days by default.
   * Requirements: 3.3
   */
  @Get('doctors/:id/available-slots')
  async getAvailableSlots(
    @Param('id', ParseUUIDPipe) doctorId: string,
    @Query() query: AvailableSlotsQueryDto,
  ): Promise<ApiResponse> {
    // Default to next 30 days if not specified
    const fromDate = query.fromDate ? new Date(query.fromDate) : new Date();
    const toDate = query.toDate
      ? new Date(query.toDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Get doctor to find their organization
    const doctor = await this.doctorManagementService.findById(doctorId);
    const primaryOrg = doctor.organizations?.find((org) => org.isPrimary);
    const organizationId = primaryOrg?.id || doctor.organizations?.[0]?.id;

    if (!organizationId) {
      return {
        success: true,
        message: 'No available slots found',
        data: [],
      };
    }

    const slots = await this.timeSlotService.findAvailable(
      doctorId,
      organizationId,
      fromDate,
      toDate,
    );

    return {
      success: true,
      message: 'Available slots retrieved successfully',
      data: slots,
    };
  }

  /**
   * Book an appointment.
   * Requirements: 3.5
   */
  @Post('appointments')
  @UseGuards(PatientJwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async createAppointment(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    // If organizationId not provided, derive it from the time slot
    let organizationId = dto.organizationId;
    if (!organizationId) {
      const timeSlot = await this.timeSlotService.findById(dto.timeSlotId);
      organizationId = timeSlot.organizationId;
    }

    const appointment = await this.appointmentService.create(
      {
        doctorId: dto.doctorId,
        organizationId,
        timeSlotId: dto.timeSlotId,
        reasonForVisit: dto.reasonForVisit,
      },
      user,
    );

    return {
      success: true,
      message: 'Appointment booked successfully',
      data: appointment,
    };
  }

  /**
   * Get patient's appointments.
   * Requirements: 4.1
   */
  @Get('appointments')
  @UseGuards(PatientJwtGuard)
  async getAppointments(
    @Query() query: PatientAppointmentQueryDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const result = await this.appointmentService.findByPatient(user.userId, {
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 20,
      sortBy: query.sortBy || 'appointmentDate',
      sortOrder: query.sortOrder || 'DESC',
    });

    return {
      success: true,
      message: 'Appointments retrieved successfully',
      data: result,
    };
  }

  /**
   * Get appointment details.
   * Requirements: 4.2
   */
  @Get('appointments/:id')
  @UseGuards(PatientJwtGuard)
  async getAppointmentById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    const appointment = await this.appointmentService.findById(id);

    // Verify the appointment belongs to the patient
    if (appointment.patientId !== user.userId) {
      return {
        success: false,
        message: 'Appointment not found',
      };
    }

    return {
      success: true,
      message: 'Appointment retrieved successfully',
      data: appointment,
    };
  }

  /**
   * Cancel an appointment.
   * Requirements: 4.3, 4.4, 4.5
   */
  @Post('appointments/:id/cancel')
  @UseGuards(PatientJwtGuard)
  @HttpCode(HttpStatus.OK)
  async cancelAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelBookingDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ApiResponse> {
    // Verify the appointment belongs to the patient
    const appointment = await this.appointmentService.findById(id);
    if (appointment.patientId !== user.userId) {
      return {
        success: false,
        message: 'Appointment not found',
      };
    }

    const cancelled = await this.appointmentService.cancel(
      id,
      { reason: dto.reason },
      user,
    );

    return {
      success: true,
      message: 'Appointment cancelled successfully',
      data: cancelled,
    };
  }
}
