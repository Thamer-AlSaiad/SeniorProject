import { useQuery } from '@tanstack/react-query';
import { patientService } from '../services/patientService';

export const usePatients = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientService.getAll(params),
  });
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientService.getById(id),
    enabled: !!id,
  });
};
