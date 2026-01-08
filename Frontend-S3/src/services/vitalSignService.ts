import apiClient, { API_ENDPOINTS } from './api';
import { ApiResponse, VitalSign, CreateVitalSignDto, VitalSignType } from '../types';

export const vitalSignService = {
  getByPatient: async (patientId: string) => {
    const response = await apiClient.get<ApiResponse<VitalSign[]>>(
      API_ENDPOINTS.vitalSigns.byPatient(patientId)
    );
    return response.data;
  },

  getLatestAll: async (patientId: string) => {
    const response = await apiClient.get<ApiResponse<Record<VitalSignType, VitalSign | null>>>(
      API_ENDPOINTS.vitalSigns.latestAll(patientId)
    );
    return response.data;
  },

  getByEncounter: async (encounterId: string) => {
    const response = await apiClient.get<ApiResponse<VitalSign[]>>(
      API_ENDPOINTS.vitalSigns.byEncounter(encounterId)
    );
    return response.data;
  },

  create: async (data: CreateVitalSignDto) => {
    const response = await apiClient.post<ApiResponse<VitalSign>>(API_ENDPOINTS.vitalSigns.base, data);
    return response.data;
  },

  createBulk: async (patientId: string, encounterId: string | undefined, vitals: Omit<CreateVitalSignDto, 'patientId' | 'encounterId'>[]) => {
    const response = await apiClient.post<ApiResponse<VitalSign[]>>(API_ENDPOINTS.vitalSigns.bulk, {
      patientId,
      encounterId,
      vitals,
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.vitalSigns.byId(id));
    return response.data;
  },
};
