import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vitalSignService } from '../services/vitalSignService';
import { CreateVitalSignDto } from '../types';
import toast from 'react-hot-toast';

export const usePatientVitalSigns = (patientId: string) => {
  return useQuery({
    queryKey: ['vitalSigns', 'patient', patientId],
    queryFn: () => vitalSignService.getByPatient(patientId),
    enabled: !!patientId,
  });
};

export const useLatestVitalSigns = (patientId: string) => {
  return useQuery({
    queryKey: ['vitalSigns', 'latest', patientId],
    queryFn: () => vitalSignService.getLatestAll(patientId),
    enabled: !!patientId,
  });
};

export const useEncounterVitalSigns = (encounterId: string) => {
  return useQuery({
    queryKey: ['vitalSigns', 'encounter', encounterId],
    queryFn: () => vitalSignService.getByEncounter(encounterId),
    enabled: !!encounterId,
  });
};

export const useCreateVitalSign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateVitalSignDto) => vitalSignService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vitalSigns'] });
      if (variables.patientId) {
        queryClient.invalidateQueries({ queryKey: ['vitalSigns', 'patient', variables.patientId] });
        queryClient.invalidateQueries({ queryKey: ['vitalSigns', 'latest', variables.patientId] });
      }
      if (variables.encounterId) {
        queryClient.invalidateQueries({ queryKey: ['vitalSigns', 'encounter', variables.encounterId] });
      }
      toast.success('Vital sign recorded');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record vital sign');
    },
  });
};

export const useCreateBulkVitalSigns = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ patientId, encounterId, vitals }: {
      patientId: string;
      encounterId?: string;
      vitals: Omit<CreateVitalSignDto, 'patientId' | 'encounterId'>[];
    }) => vitalSignService.createBulk(patientId, encounterId, vitals),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vitalSigns'] });
      queryClient.invalidateQueries({ queryKey: ['vitalSigns', 'patient', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['vitalSigns', 'latest', variables.patientId] });
      if (variables.encounterId) {
        queryClient.invalidateQueries({ queryKey: ['vitalSigns', 'encounter', variables.encounterId] });
      }
      toast.success('Vital signs recorded');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record vital signs');
    },
  });
};

export const useDeleteVitalSign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => vitalSignService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitalSigns'] });
      toast.success('Vital sign deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete vital sign');
    },
  });
};
