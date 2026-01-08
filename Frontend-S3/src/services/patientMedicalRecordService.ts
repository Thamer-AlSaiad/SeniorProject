import apiClient, { PATIENT_ENDPOINTS } from './api';
import {
  ApiResponse,
  MedicalRecord,
  Allergy,
  Encounter,
} from '../types';

export const patientMedicalRecordService = {
  // Get patient's medical records (only finalized)
  getMedicalRecords: async () => {
    const response = await apiClient.get<ApiResponse<MedicalRecord[]>>(
      PATIENT_ENDPOINTS.patientMedicalRecords.base
    );
    return response.data;
  },

  // Get medical record by ID
  getMedicalRecordById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<MedicalRecord>>(
      PATIENT_ENDPOINTS.patientMedicalRecords.byId(id)
    );
    return response.data;
  },

  // Get patient's allergies
  getAllergies: async () => {
    const response = await apiClient.get<ApiResponse<Allergy[]>>(
      PATIENT_ENDPOINTS.patientAllergies
    );
    return response.data;
  },

  // Get patient's encounters
  getEncounters: async () => {
    const response = await apiClient.get<ApiResponse<Encounter[]>>(
      PATIENT_ENDPOINTS.patientEncounters
    );
    return response.data;
  },
};
