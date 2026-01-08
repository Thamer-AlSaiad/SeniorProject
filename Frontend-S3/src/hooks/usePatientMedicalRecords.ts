import { useQuery } from '@tanstack/react-query';
import { patientMedicalRecordService } from '../services/patientMedicalRecordService';

export const usePatientMedicalRecordsPage = () => {
  // Fetch medical records
  const {
    data: recordsData,
    isLoading: isLoadingRecords,
    refetch: refetchRecords,
  } = useQuery({
    queryKey: ['patient-medical-records'],
    queryFn: () => patientMedicalRecordService.getMedicalRecords(),
  });

  // Fetch allergies
  const {
    data: allergiesData,
    isLoading: isLoadingAllergies,
    refetch: refetchAllergies,
  } = useQuery({
    queryKey: ['patient-allergies'],
    queryFn: () => patientMedicalRecordService.getAllergies(),
  });

  // Fetch encounters
  const {
    data: encountersData,
    isLoading: isLoadingEncounters,
    refetch: refetchEncounters,
  } = useQuery({
    queryKey: ['patient-encounters'],
    queryFn: () => patientMedicalRecordService.getEncounters(),
  });

  // Handle paginated responses - data can be { items: [], total: number } or direct array
  const extractItems = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.items && Array.isArray(data.items)) return data.items;
    return [];
  };

  return {
    // Medical Records (paginated response)
    medicalRecords: extractItems(recordsData?.data),
    isLoadingRecords,
    refetchRecords,

    // Allergies (direct array)
    allergies: extractItems(allergiesData?.data),
    isLoadingAllergies,
    refetchAllergies,

    // Encounters (paginated response)
    encounters: extractItems(encountersData?.data),
    isLoadingEncounters,
    refetchEncounters,
  };
};

export const usePatientMedicalRecord = (id: string) => {
  return useQuery({
    queryKey: ['patient-medical-record', id],
    queryFn: () => patientMedicalRecordService.getMedicalRecordById(id),
    enabled: !!id,
  });
};
