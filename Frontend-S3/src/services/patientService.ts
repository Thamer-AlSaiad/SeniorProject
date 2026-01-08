import apiClient, { API_ENDPOINTS } from './api';
import { ApiResponse, PaginatedResponse, Patient } from '../types';

export const patientService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Patient>>>(
      API_ENDPOINTS.patients.base,
      { params }
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Patient>>(
      API_ENDPOINTS.patients.byId(id)
    );
    return response.data;
  },
};
