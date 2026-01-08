import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicalRecordService } from '../services/medicalRecordService';
import { CreateMedicalRecordDto } from '../types';
import toast from 'react-hot-toast';

export const useMedicalRecords = (params?: { page?: number; limit?: number; patientId?: string; encounterId?: string }) => {
  return useQuery({
    queryKey: ['medicalRecords', params],
    queryFn: () => medicalRecordService.getAll(params),
  });
};

export const usePatientMedicalRecords = (patientId: string) => {
  return useQuery({
    queryKey: ['medicalRecords', 'patient', patientId],
    queryFn: () => medicalRecordService.getByPatient(patientId),
    enabled: !!patientId,
  });
};

export const useEncounterMedicalRecord = (encounterId: string) => {
  return useQuery({
    queryKey: ['medicalRecords', 'encounter', encounterId],
    queryFn: () => medicalRecordService.getByEncounter(encounterId),
    enabled: !!encounterId,
  });
};

export const useMedicalRecord = (id: string) => {
  return useQuery({
    queryKey: ['medicalRecord', id],
    queryFn: () => medicalRecordService.getById(id),
    enabled: !!id,
  });
};

export const useCreateMedicalRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMedicalRecordDto) => medicalRecordService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] });
      toast.success('Medical record created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create medical record');
    },
  });
};

export const useUpdateMedicalRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMedicalRecordDto> }) =>
      medicalRecordService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] });
      queryClient.invalidateQueries({ queryKey: ['medicalRecord', variables.id] });
      toast.success('Medical record updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update medical record');
    },
  });
};

export const useUpdateMedicalRecordField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, field, value }: { id: string; field: string; value: string }) =>
      medicalRecordService.updateField(id, field, value),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecord', variables.id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update field');
    },
  });
};

export const useFinalizeMedicalRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => medicalRecordService.finalize(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] });
      queryClient.invalidateQueries({ queryKey: ['medicalRecord', id] });
      toast.success('Medical record finalized');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to finalize medical record');
    },
  });
};

export const useDeleteMedicalRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => medicalRecordService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] });
      toast.success('Medical record deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete medical record');
    },
  });
};
