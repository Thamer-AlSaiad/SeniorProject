import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../services/appointmentService';
import { AppointmentFilters, CancelAppointmentDto } from '../types';
import toast from 'react-hot-toast';

export const useAppointments = (filters?: AppointmentFilters) => {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => appointmentService.getAll(filters),
  });
};

export const useTodayAppointments = () => {
  return useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: () => appointmentService.getToday(),
  });
};

export const useAppointment = (id: string) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentService.getById(id),
    enabled: !!id,
  });
};

export const useCheckInAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentService.checkIn(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      toast.success('Patient checked in successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to check in patient');
    },
  });
};

export const useStartVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentService.startVisit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
      toast.success('Visit started successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start visit');
    },
  });
};

export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentService.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      toast.success('Appointment completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete appointment');
    },
  });
};

export const useMarkNoShow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentService.markNoShow(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      toast.success('Appointment marked as no-show');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark as no-show');
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelAppointmentDto }) =>
      appointmentService.cancel(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] });
      toast.success('Appointment cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    },
  });
};
