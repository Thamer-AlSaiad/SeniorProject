import apiClient, { API_ENDPOINTS } from './api';
import { ApiResponse, PaginatedResponse, Allergy, CreateAllergyDto } from '../types';

export const allergyService = {
  getAll: async (params?: { page?: number; limit?: number; patientId?: string }) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Allergy>>>(
      API_ENDPOINTS.allergies.base,
      { params }
    );
    return response.data;
  },

  getByPatient: async (patientId: string, activeOnly = true) => {
    const response = await apiClient.get<ApiResponse<Allergy[]>>(
      API_ENDPOINTS.allergies.byPatient(patientId),
      { params: { activeOnly } }
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Allergy>>(API_ENDPOINTS.allergies.byId(id));
    return response.data;
  },

  create: async (data: CreateAllergyDto) => {
    const response = await apiClient.post<ApiResponse<Allergy>>(API_ENDPOINTS.allergies.base, data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateAllergyDto>) => {
    const response = await apiClient.put<ApiResponse<Allergy>>(API_ENDPOINTS.allergies.byId(id), data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.allergies.byId(id));
    return response.data;
  },
};
