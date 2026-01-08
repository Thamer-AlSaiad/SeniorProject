import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '../services/organizationService';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../types';

export const useOrganizations = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ['organizations', params],
    queryFn: () => organizationService.getAll(params),
  });
};

export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationService.getById(id),
    enabled: !!id,
  });
};

export const useOrganizationDoctors = (id: string) => {
  return useQuery({
    queryKey: ['organization-doctors', id],
    queryFn: () => organizationService.getDoctors(id),
    enabled: !!id,
  });
};

export const useOrganizationStats = (id: string) => {
  return useQuery({
    queryKey: ['organization-stats', id],
    queryFn: () => organizationService.getStats(id),
    enabled: !!id,
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dto: CreateOrganizationDto) => organizationService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOrganizationDto }) => 
      organizationService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
  });
};

export const useDeactivateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => organizationService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
  });
};

export const useActivateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => organizationService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
  });
};
