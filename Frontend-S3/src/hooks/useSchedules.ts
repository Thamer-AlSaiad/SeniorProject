import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '../services/scheduleService';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  GenerateSlotsDto,
  CreateScheduleExceptionDto,
} from '../types';
import toast from 'react-hot-toast';

// Schedule Hooks
export const useSchedules = (activeOnly?: boolean) => {
  return useQuery({
    queryKey: ['schedules', { activeOnly }],
    queryFn: () => scheduleService.getAll(activeOnly),
  });
};

export const useSchedule = (id: string) => {
  return useQuery({
    queryKey: ['schedule', id],
    queryFn: () => scheduleService.getById(id),
    enabled: !!id,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduleDto) => scheduleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create schedule');
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScheduleDto }) =>
      scheduleService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedule', variables.id] });
      toast.success('Schedule updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update schedule');
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => scheduleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete schedule');
    },
  });
};

export const useGenerateSlots = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GenerateSlotsDto }) =>
      scheduleService.generateSlots(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success(response.message || 'Time slots generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate time slots');
    },
  });
};

// Schedule Exception Hooks
export const useScheduleExceptions = (fromDate?: string, toDate?: string) => {
  return useQuery({
    queryKey: ['scheduleExceptions', { fromDate, toDate }],
    queryFn: () => scheduleService.exceptions.getAll(fromDate, toDate),
  });
};

export const useUpcomingExceptions = () => {
  return useQuery({
    queryKey: ['scheduleExceptions', 'upcoming'],
    queryFn: () => scheduleService.exceptions.getUpcoming(),
  });
};

export const useCreateScheduleException = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduleExceptionDto) =>
      scheduleService.exceptions.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['scheduleExceptions'] });
      const affected = response.data?.affectedAppointments || 0;
      if (affected > 0) {
        toast.success(`Exception created. ${affected} appointment(s) may be affected.`);
      } else {
        toast.success('Schedule exception created successfully');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create exception');
    },
  });
};

export const useDeleteScheduleException = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => scheduleService.exceptions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduleExceptions'] });
      toast.success('Schedule exception deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete exception');
    },
  });
};
