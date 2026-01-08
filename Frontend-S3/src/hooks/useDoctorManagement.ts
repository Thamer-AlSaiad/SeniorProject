import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorManagementService } from '../services/doctorManagementService';
import { CreateDoctorDto, UpdateDoctorDto } from '../types';

export const useDoctorManagement = (params?: { page?: number; limit?: number; search?: string; organizationId?: string }) => {
  return useQuery({
    queryKey: ['admin-doctors', params],
    queryFn: () => doctorManagementService.getAll(params),
  });
};

export const useDoctor = (id: string) => {
  return useQuery({
    queryKey: ['admin-doctor', id],
    queryFn: () => doctorManagementService.getById(id),
    enabled: !!id,
  });
};

export const useCreateDoctor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dto: CreateDoctorDto) => doctorManagementService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
    },
  });
};

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDoctorDto }) => 
      doctorManagementService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-doctor'] });
    },
  });
};

export const useSuspendDoctor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => doctorManagementService.suspend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-doctor'] });
    },
  });
};

export const useActivateDoctor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => doctorManagementService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-doctor'] });
    },
  });
};

export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => doctorManagementService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-doctor'] });
    },
  });
};

export const useAssignDoctorToOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ doctorId, organizationId }: { doctorId: string; organizationId: string }) => 
      doctorManagementService.assignToOrganization(doctorId, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-doctor'] });
      queryClient.invalidateQueries({ queryKey: ['organization-doctors'] });
    },
  });
};

export const useRemoveDoctorFromOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ doctorId, organizationId }: { doctorId: string; organizationId: string }) => 
      doctorManagementService.removeFromOrganization(doctorId, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-doctor'] });
      queryClient.invalidateQueries({ queryKey: ['organization-doctors'] });
    },
  });
};
