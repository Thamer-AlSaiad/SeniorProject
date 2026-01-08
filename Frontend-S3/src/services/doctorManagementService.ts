import apiClient, { API_ENDPOINTS } from './api';
import {
  ApiResponse,
  PaginatedResponse,
  Doctor,
  CreateDoctorDto,
  UpdateDoctorDto,
} from '../types';

export const doctorManagementService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; organizationId?: string }) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Doctor>>>(
      API_ENDPOINTS.doctorManagement.base,
      { params }
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Doctor>>(
      API_ENDPOINTS.doctorManagement.byId(id)
    );
    return response.data;
  },

  create: async (dto: CreateDoctorDto) => {
    const response = await apiClient.post<ApiResponse<Doctor>>(
      API_ENDPOINTS.doctorManagement.base,
      dto
    );
    return response.data;
  },

  update: async (id: string, dto: UpdateDoctorDto) => {
    const response = await apiClient.put<ApiResponse<Doctor>>(
      API_ENDPOINTS.doctorManagement.byId(id),
      dto
    );
    return response.data;
  },

  suspend: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Doctor>>(
      API_ENDPOINTS.doctorManagement.suspend(id)
    );
    return response.data;
  },

  activate: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Doctor>>(
      API_ENDPOINTS.doctorManagement.activate(id)
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.doctorManagement.byId(id)
    );
    return response.data;
  },

  assignToOrganization: async (doctorId: string, organizationId: string) => {
    const response = await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.doctorManagement.assignOrg(doctorId),
      { organizationId }
    );
    return response.data;
  },

  removeFromOrganization: async (doctorId: string, organizationId: string) => {
    const response = await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.doctorManagement.removeOrg(doctorId),
      { organizationId }
    );
    return response.data;
  },
};
