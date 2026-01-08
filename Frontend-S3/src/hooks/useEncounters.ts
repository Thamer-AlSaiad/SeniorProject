import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { encounterService } from '../services/encounterService';
import { CreateEncounterDto } from '../types';
import toast from 'react-hot-toast';

export const useEncounters = (params?: { page?: number; limit?: number; patientId?: string; status?: string; search?: string }) => {
  return useQuery({
    queryKey: ['encounters', params],
    queryFn: () => encounterService.getAll(params),
  });
};

export const useActiveEncounters = () => {
  return useQuery({
    queryKey: ['encounters', 'active'],
    queryFn: () => encounterService.getActive(),
  });
};

export const usePatientEncounters = (patientId: string) => {
  return useQuery({
    queryKey: ['encounters', 'patient', patientId],
    queryFn: () => encounterService.getByPatient(patientId),
    enabled: !!patientId,
  });
};

export const useEncounter = (id: string) => {
  return useQuery({
    queryKey: ['encounter', id],
    queryFn: () => encounterService.getById(id),
    enabled: !!id,
  });
};

export const useCreateEncounter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateEncounterDto) => encounterService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
      toast.success('Encounter created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create encounter');
    },
  });
};

export const useUpdateEncounter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEncounterDto> }) =>
      encounterService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
      queryClient.invalidateQueries({ queryKey: ['encounter', variables.id] });
      toast.success('Encounter updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update encounter');
    },
  });
};

export const useStartEncounter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => encounterService.start(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
      queryClient.invalidateQueries({ queryKey: ['encounter', id] });
      toast.success('Encounter started');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start encounter');
    },
  });
};

export const useCompleteEncounter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => encounterService.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
      queryClient.invalidateQueries({ queryKey: ['encounter', id] });
      toast.success('Encounter completed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete encounter');
    },
  });
};

export const useCancelEncounter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => encounterService.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
      queryClient.invalidateQueries({ queryKey: ['encounter', id] });
      toast.success('Encounter cancelled');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel encounter');
    },
  });
};

export const useDeleteEncounter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => encounterService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
      toast.success('Encounter deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete encounter');
    },
  });
};
