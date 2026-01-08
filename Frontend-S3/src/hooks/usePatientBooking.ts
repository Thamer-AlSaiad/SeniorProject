import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientBookingService, CreatePatientAppointmentDto } from '../services/patientBookingService';
import { Organization, Doctor, TimeSlot, Appointment } from '../types';
import toast from 'react-hot-toast';

interface UsePatientBookingOptions {
  page?: number;
  limit?: number;
  status?: string;
}

export const usePatientBooking = (options?: UsePatientBookingOptions) => {
  const queryClient = useQueryClient();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Fetch clinics
  const {
    data: clinicsData,
    isLoading: isLoadingClinics,
    refetch: refetchClinics,
  } = useQuery({
    queryKey: ['patient-clinics'],
    queryFn: () => patientBookingService.getClinics(),
  });

  // Fetch patient appointments
  const {
    data: appointmentsData,
    isLoading: isLoadingAppointments,
    refetch: refetchAppointments,
  } = useQuery({
    queryKey: ['patient-appointments', options?.page, options?.limit, options?.status],
    queryFn: () => patientBookingService.getAppointments({
      page: options?.page,
      limit: options?.limit,
      status: options?.status,
    }),
  });

  // Fetch doctors for a clinic
  const fetchDoctors = useCallback(async (clinicId: string) => {
    setIsLoadingDoctors(true);
    try {
      const response = await patientBookingService.getClinicDoctors(clinicId);
      setDoctors(response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load doctors');
      setDoctors([]);
    } finally {
      setIsLoadingDoctors(false);
    }
  }, []);

  // Fetch available slots for a doctor
  const fetchAvailableSlots = useCallback(async (doctorId: string, startDate?: string, endDate?: string) => {
    setIsLoadingSlots(true);
    try {
      const response = await patientBookingService.getAvailableSlots(doctorId, {
        startDate,
        endDate,
      });
      setAvailableSlots(response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load available slots');
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: (data: CreatePatientAppointmentDto) => patientBookingService.bookAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      toast.success('Appointment booked successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    },
  });

  // Cancel appointment mutation
  const cancelAppointmentMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      patientBookingService.cancelAppointment(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      toast.success('Appointment cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    },
  });

  const bookAppointment = async (data: CreatePatientAppointmentDto) => {
    return bookAppointmentMutation.mutateAsync(data);
  };

  const cancelAppointment = async (id: string, reason: string) => {
    return cancelAppointmentMutation.mutateAsync({ id, reason });
  };

  return {
    // Clinics
    clinics: clinicsData?.data || [],
    isLoadingClinics,
    refetchClinics,

    // Doctors
    doctors,
    isLoadingDoctors,
    fetchDoctors,

    // Available Slots
    availableSlots,
    isLoadingSlots,
    fetchAvailableSlots,

    // Appointments
    appointments: appointmentsData?.data?.items || [],
    totalAppointments: appointmentsData?.data?.total || 0,
    totalPages: appointmentsData?.data?.totalPages || 1,
    isLoadingAppointments,
    refetchAppointments,

    // Mutations
    bookAppointment,
    isBooking: bookAppointmentMutation.isPending,
    cancelAppointment,
    isCancelling: cancelAppointmentMutation.isPending,
  };
};
