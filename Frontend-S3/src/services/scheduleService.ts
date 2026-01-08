import apiClient, { API_ENDPOINTS } from './api';
import {
  ApiResponse,
  Schedule,
  CreateScheduleDto,
  UpdateScheduleDto,
  GenerateSlotsDto,
  TimeSlot,
  ScheduleException,
  CreateScheduleExceptionDto,
} from '../types';

export const scheduleService = {
  // Get all schedules for current doctor
  getAll: async (activeOnly?: boolean) => {
    const response = await apiClient.get<ApiResponse<Schedule[]>>(
      API_ENDPOINTS.schedules.base,
      { params: { activeOnly } }
    );
    return response.data;
  },

  // Get schedule by ID
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Schedule>>(
      API_ENDPOINTS.schedules.byId(id)
    );
    return response.data;
  },

  // Create schedule
  create: async (data: CreateScheduleDto) => {
    const response = await apiClient.post<ApiResponse<Schedule>>(
      API_ENDPOINTS.schedules.base,
      data
    );
    return response.data;
  },

  // Update schedule
  update: async (id: string, data: UpdateScheduleDto) => {
    const response = await apiClient.put<ApiResponse<Schedule>>(
      API_ENDPOINTS.schedules.byId(id),
      data
    );
    return response.data;
  },

  // Delete schedule
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.schedules.byId(id)
    );
    return response.data;
  },

  // Generate time slots for a schedule
  generateSlots: async (id: string, data: GenerateSlotsDto) => {
    const response = await apiClient.post<ApiResponse<TimeSlot[]>>(
      API_ENDPOINTS.schedules.generateSlots(id),
      data
    );
    return response.data;
  },

  // Schedule Exceptions
  exceptions: {
    // Get all exceptions
    getAll: async (fromDate?: string, toDate?: string) => {
      const response = await apiClient.get<ApiResponse<ScheduleException[]>>(
        API_ENDPOINTS.scheduleExceptions.base,
        { params: { fromDate, toDate } }
      );
      return response.data;
    },

    // Get upcoming exceptions
    getUpcoming: async () => {
      const response = await apiClient.get<ApiResponse<ScheduleException[]>>(
        API_ENDPOINTS.scheduleExceptions.upcoming
      );
      return response.data;
    },

    // Get exception by ID
    getById: async (id: string) => {
      const response = await apiClient.get<ApiResponse<ScheduleException>>(
        API_ENDPOINTS.scheduleExceptions.byId(id)
      );
      return response.data;
    },

    // Create exception
    create: async (data: CreateScheduleExceptionDto) => {
      const response = await apiClient.post<ApiResponse<{ exception: ScheduleException; affectedAppointments: number }>>(
        API_ENDPOINTS.scheduleExceptions.base,
        data
      );
      return response.data;
    },

    // Delete exception
    delete: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<void>>(
        API_ENDPOINTS.scheduleExceptions.byId(id)
      );
      return response.data;
    },
  },
};
