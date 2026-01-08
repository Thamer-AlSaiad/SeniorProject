import apiClient, { API_ENDPOINTS } from './api';
import { ApiResponse, PaginatedResponse, Encounter, CreateEncounterDto } from '../types';

export const encounterService = {
  // Get all encounters with pagination
  getAll: async (params?: { page?: number; limit?: number; patientId?: string; status?: string; search?: string }) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Encounter>>>(
      API_ENDPOINTS.encounters.base,
      { params }
    );
    return response.data;
  },

  // Get active encounters for current doctor
  getActive: async () => {
    const response = await apiClient.get<ApiResponse<Encounter[]>>(API_ENDPOINTS.encounters.active);
    return response.data;
  },

  // Get encounters by patient
  getByPatient: async (patientId: string) => {
    const response = await apiClient.get<ApiResponse<Encounter[]>>(
      API_ENDPOINTS.encounters.byPatient(patientId)
    );
    return response.data;
  },

  // Get single encounter
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Encounter>>(API_ENDPOINTS.encounters.byId(id));
    return response.data;
  },

  // Create encounter
  create: async (data: CreateEncounterDto) => {
    const response = await apiClient.post<ApiResponse<Encounter>>(API_ENDPOINTS.encounters.base, data);
    return response.data;
  },

  // Update encounter
  update: async (id: string, data: Partial<CreateEncounterDto>) => {
    const response = await apiClient.put<ApiResponse<Encounter>>(API_ENDPOINTS.encounters.byId(id), data);
    return response.data;
  },

  // Start encounter
  start: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Encounter>>(API_ENDPOINTS.encounters.start(id));
    return response.data;
  },

  // Complete encounter
  complete: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Encounter>>(API_ENDPOINTS.encounters.complete(id));
    return response.data;
  },

  // Cancel encounter
  cancel: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Encounter>>(API_ENDPOINTS.encounters.cancel(id));
    return response.data;
  },

  // Delete encounter
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.encounters.byId(id));
    return response.data;
  },
};
