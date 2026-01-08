import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { allergyService } from '../services/allergyService';
import { CreateAllergyDto } from '../types';
import toast from 'react-hot-toast';

export const useAllergies = (params?: { page?: number; limit?: number; patientId?: string }) => {
  return useQuery({
    queryKey: ['allergies', params],
    queryFn: () => allergyService.getAll(params),
  });
};

export const usePatientAllergies = (patientId: string, activeOnly = true) => {
  return useQuery({
    queryKey: ['allergies', 'patient', patientId, activeOnly],
    queryFn: () => allergyService.getByPatient(patientId, activeOnly),
    enabled: !!patientId,
  });
};

export const useAllergy = (id: string) => {
  return useQuery({
    queryKey: ['allergy', id],
    queryFn: () => allergyService.getById(id),
    enabled: !!id,
  });
};

export const useCreateAllergy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAllergyDto) => allergyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergies'] });
      toast.success('Allergy recorded');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record allergy');
    },
  });
};

export const useUpdateAllergy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAllergyDto> }) =>
      allergyService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allergies'] });
      queryClient.invalidateQueries({ queryKey: ['allergy', variables.id] });
      toast.success('Allergy updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update allergy');
    },
  });
};

export const useDeleteAllergy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => allergyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergies'] });
      toast.success('Allergy deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete allergy');
    },
  });
};
