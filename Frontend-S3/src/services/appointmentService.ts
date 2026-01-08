import apiClient, { API_ENDPOINTS } from './api';
import {
  ApiResponse,
  PaginatedResponse,
  Appointment,
  AppointmentFilters,
  CancelAppointmentDto,
} from '../types';

export const appointmentService = {
  // Get all appointments with filters
  getAll: async (filters?: AppointmentFilters) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Appointment>>>(
      API_ENDPOINTS.appointments.base,
      { params: filters }
    );
    return response.data;
  },

  // Get today's appointments
  getToday: async () => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Appointment>>>(
      API_ENDPOINTS.appointments.today
    );
    return response.data;
  },

  // Get appointment by ID
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Appointment>>(
      API_ENDPOINTS.appointments.byId(id)
    );
    return response.data;
  },

  // Check in patient
  checkIn: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Appointment>>(
      API_ENDPOINTS.appointments.checkIn(id)
    );
    return response.data;
  },

  // Start visit (creates encounter)
  startVisit: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Appointment>>(
      API_ENDPOINTS.appointments.start(id)
    );
    return response.data;
  },

  // Complete appointment
  complete: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Appointment>>(
      API_ENDPOINTS.appointments.complete(id)
    );
    return response.data;
  },

  // Mark as no-show
  markNoShow: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Appointment>>(
      API_ENDPOINTS.appointments.noShow(id)
    );
    return response.data;
  },

  // Cancel appointment
  cancel: async (id: string, data: CancelAppointmentDto) => {
    const response = await apiClient.post<ApiResponse<Appointment>>(
      API_ENDPOINTS.appointments.cancel(id),
      data
    );
    return response.data;
  },
};
