import apiClient, { PATIENT_ENDPOINTS } from './api';
import {
  ApiResponse,
  PaginatedResponse,
  Organization,
  Doctor,
  TimeSlot,
  Appointment,
  CancelAppointmentDto,
} from '../types';

export interface CreatePatientAppointmentDto {
  doctorId: string;
  timeSlotId: string;
  reasonForVisit?: string;
}

export interface AvailableSlotsParams {
  startDate?: string;
  endDate?: string;
}

export const patientBookingService = {
  // Get active clinics/organizations
  getClinics: async () => {
    const response = await apiClient.get<ApiResponse<Organization[]>>(
      PATIENT_ENDPOINTS.clinics.base
    );
    return response.data;
  },

  // Get doctors by clinic
  getClinicDoctors: async (clinicId: string) => {
    const response = await apiClient.get<ApiResponse<Doctor[]>>(
      PATIENT_ENDPOINTS.clinics.doctors(clinicId)
    );
    return response.data;
  },

  // Get available slots for a doctor
  getAvailableSlots: async (doctorId: string, params?: AvailableSlotsParams) => {
    const response = await apiClient.get<ApiResponse<TimeSlot[]>>(
      PATIENT_ENDPOINTS.availableSlots(doctorId),
      { params }
    );
    return response.data;
  },

  // Book an appointment
  bookAppointment: async (data: CreatePatientAppointmentDto) => {
    const response = await apiClient.post<ApiResponse<Appointment>>(
      PATIENT_ENDPOINTS.patientAppointments.base,
      data
    );
    return response.data;
  },

  // Get patient's appointments
  getAppointments: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Appointment>>>(
      PATIENT_ENDPOINTS.patientAppointments.base,
      { params }
    );
    return response.data;
  },

  // Get appointment by ID
  getAppointmentById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Appointment>>(
      PATIENT_ENDPOINTS.patientAppointments.byId(id)
    );
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id: string, data: CancelAppointmentDto) => {
    const response = await apiClient.post<ApiResponse<Appointment>>(
      PATIENT_ENDPOINTS.patientAppointments.cancel(id),
      data
    );
    return response.data;
  },
};
