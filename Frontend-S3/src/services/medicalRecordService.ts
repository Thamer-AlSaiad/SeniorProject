import apiClient, { API_ENDPOINTS } from './api';
import { ApiResponse, PaginatedResponse, MedicalRecord, CreateMedicalRecordDto } from '../types';

export const medicalRecordService = {
  // Get all medical records
  getAll: async (params?: { page?: number; limit?: number; patientId?: string; encounterId?: string }) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<MedicalRecord>>>(
      API_ENDPOINTS.medicalRecords.base,
      { params }
    );
    return response.data;
  },

  // Get by patient
  getByPatient: async (patientId: string) => {
    const response = await apiClient.get<ApiResponse<MedicalRecord[]>>(
      API_ENDPOINTS.medicalRecords.byPatient(patientId)
    );
    return response.data;
  },

  // Get by encounter
  getByEncounter: async (encounterId: string) => {
    const response = await apiClient.get<ApiResponse<MedicalRecord | null>>(
      API_ENDPOINTS.medicalRecords.byEncounter(encounterId)
    );
    return response.data;
  },

  // Get by ID
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<MedicalRecord>>(
      API_ENDPOINTS.medicalRecords.byId(id)
    );
    return response.data;
  },

  // Create
  create: async (data: CreateMedicalRecordDto) => {
    const response = await apiClient.post<ApiResponse<MedicalRecord>>(
      API_ENDPOINTS.medicalRecords.base,
      data
    );
    return response.data;
  },

  // Update
  update: async (id: string, data: Partial<CreateMedicalRecordDto>) => {
    const response = await apiClient.put<ApiResponse<MedicalRecord>>(
      API_ENDPOINTS.medicalRecords.byId(id),
      data
    );
    return response.data;
  },

  // Update single field
  updateField: async (id: string, field: string, value: string) => {
    const response = await apiClient.put<ApiResponse<MedicalRecord>>(
      API_ENDPOINTS.medicalRecords.updateField(id),
      { field, value }
    );
    return response.data;
  },

  // Finalize
  finalize: async (id: string) => {
    const response = await apiClient.post<ApiResponse<MedicalRecord>>(
      API_ENDPOINTS.medicalRecords.finalize(id)
    );
    return response.data;
  },

  // Delete
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.medicalRecords.byId(id));
    return response.data;
  },
};
