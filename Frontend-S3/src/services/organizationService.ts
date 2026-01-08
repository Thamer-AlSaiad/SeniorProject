import apiClient, { API_ENDPOINTS } from './api';
import {
  ApiResponse,
  PaginatedResponse,
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationStats,
  Doctor,
} from '../types';

export const organizationService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Organization>>>(
      API_ENDPOINTS.organizations.base,
      { params }
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Organization>>(
      API_ENDPOINTS.organizations.byId(id)
    );
    return response.data;
  },

  create: async (dto: CreateOrganizationDto) => {
    const response = await apiClient.post<ApiResponse<Organization>>(
      API_ENDPOINTS.organizations.base,
      dto
    );
    return response.data;
  },

  update: async (id: string, dto: UpdateOrganizationDto) => {
    const response = await apiClient.put<ApiResponse<Organization>>(
      API_ENDPOINTS.organizations.byId(id),
      dto
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.organizations.byId(id)
    );
    return response.data;
  },

  deactivate: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Organization>>(
      API_ENDPOINTS.organizations.deactivate(id)
    );
    return response.data;
  },

  activate: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Organization>>(
      API_ENDPOINTS.organizations.activate(id)
    );
    return response.data;
  },

  getDoctors: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Doctor[]>>(
      API_ENDPOINTS.organizations.doctors(id)
    );
    return response.data;
  },

  getStats: async (id: string) => {
    const response = await apiClient.get<ApiResponse<OrganizationStats>>(
      API_ENDPOINTS.organizations.stats(id)
    );
    return response.data;
  },
};
