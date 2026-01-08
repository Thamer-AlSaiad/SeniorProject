import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProtectedDoctorRoute } from '../../components/doctor/ProtectedDoctorRoute';
import { DoctorLayout } from '../../components/doctor/DoctorLayout';
import { AppointmentList } from '../../components/doctor/AppointmentList';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { CardSkeleton } from '../../components/ui/skeleton';
import {
  useAppointments,
  useTodayAppointments,
  useCheckInAppointment,
  useStartVisit,
  useCompleteAppointment,
  useMarkNoShow,
  useCancelAppointment,
} from '../../hooks';
import { Appointment, AppointmentStatus, AppointmentFilters } from '../../types';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: AppointmentStatus.SCHEDULED, label: 'Scheduled' },
  { value: AppointmentStatus.CHECKED_IN, label: 'Checked In' },
  { value: AppointmentStatus.IN_PROGRESS, label: 'In Progress' },
  { value: AppointmentStatus.COMPLETED, label: 'Completed' },
  { value: AppointmentStatus.CANCELLED, label: 'Cancelled' },
  { value: AppointmentStatus.NO_SHOW, label: 'No Show' },
];

const DoctorAppointmentsPage = () => {
  const [filters, setFilters] = useState<AppointmentFilters>({
    page: 1,
    limit: 20,
  });
  const [viewMode, setViewMode] = useState<'today' | 'all'>('today');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const { data: todayData, isLoading: loadingToday } = useTodayAppointments();
  const { data: allData, isLoading: loadingAll } = useAppointments(filters);

  const checkIn = useCheckInAppointment();
  const startVisit = useStartVisit();
  const complete = useCompleteAppointment();
  const markNoShow = useMarkNoShow();
  const cancelAppointment = useCancelAppointment();

  const todayAppointments = todayData?.data?.items || [];
  const allAppointments = allData?.data?.items || [];
  const totalPages = allData?.data?.totalPages || 1;

  const appointments = viewMode === 'today' ? todayAppointments : allAppointments;
  const isLoading = viewMode === 'today' ? loadingToday : loadingAll;

  const handleCheckIn = (id: string) => {
    checkIn.mutate(id);
  };

  const handleStartVisit = (id: string) => {
    startVisit.mutate(id);
  };

  const handleComplete = (id: string) => {
    complete.mutate(id);
  };

  const handleNoShow = (id: string) => {
    markNoShow.mutate(id);
  };

  const handleCancel = (id: string, reason: string) => {
    cancelAppointment.mutate({ id, data: { reason } });
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleFilterChange = (key: keyof AppointmentFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Stats for today
  const todayStats = {
    total: todayAppointments.length,
    scheduled: todayAppointments.filter(a => a.status === AppointmentStatus.SCHEDULED).length,
    checkedIn: todayAppointments.filter(a => a.status === AppointmentStatus.CHECKED_IN).length,
    inProgress: todayAppointments.filter(a => a.status === AppointmentStatus.IN_PROGRESS).length,
    completed: todayAppointments.filter(a => a.status === AppointmentStatus.COMPLETED).length,
  };

  return (
    <ProtectedDoctorRoute>
      <DoctorLayout>
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
              <p className="text-gray-500">Manage your patient appointments</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'today' ? 'primary' : 'outline'}
                onClick={() => setViewMode('today')}
              >
                Today
              </Button>
              <Button
                variant={viewMode === 'all' ? 'primary' : 'outline'}
                onClick={() => setViewMode('all')}
              >
                All Appointments
              </Button>
            </div>
          </motion.div>

          {/* Today's Stats */}
          {viewMode === 'today' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
            >
              <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                <CardContent className="py-4">
                  <p className="text-purple-100 text-sm">Total Today</p>
                  <p className="text-2xl font-bold">{todayStats.total}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                <CardContent className="py-4">
                  <p className="text-purple-100 text-sm">Scheduled</p>
                  <p className="text-2xl font-bold">{todayStats.scheduled}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                <CardContent className="py-4">
                  <p className="text-purple-100 text-sm">Checked In</p>
                  <p className="text-2xl font-bold">{todayStats.checkedIn}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                <CardContent className="py-4">
                  <p className="text-purple-100 text-sm">In Progress</p>
                  <p className="text-2xl font-bold">{todayStats.inProgress}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                <CardContent className="py-4">
                  <p className="text-purple-100 text-sm">Completed</p>
                  <p className="text-2xl font-bold">{todayStats.completed}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Filters for All Appointments */}
          {viewMode === 'all' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="mb-6">
                <CardContent className="py-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <Select
                        value={filters.status || ''}
                        onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => setFilters({ page: 1, limit: 20 })}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Appointments List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isLoading ? (
              <div className="space-y-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : (
              <AppointmentList
                appointments={appointments}
                onCheckIn={handleCheckIn}
                onStartVisit={handleStartVisit}
                onComplete={handleComplete}
                onNoShow={handleNoShow}
                onCancel={handleCancel}
                onViewDetails={handleViewDetails}
              />
            )}
          </motion.div>

          {/* Pagination for All Appointments */}
          {viewMode === 'all' && totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={filters.page === 1}
                onClick={() => handlePageChange((filters.page || 1) - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-gray-600">
                Page {filters.page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={filters.page === totalPages}
                onClick={() => handlePageChange((filters.page || 1) + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Appointment Details</h3>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Patient</p>
                    <p className="font-medium">
                      {selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant="info">{selectedAppointment.status.replace('_', ' ')}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">
                      {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                    </p>
                  </div>
                </div>
                {selectedAppointment.reasonForVisit && (
                  <div>
                    <p className="text-sm text-gray-500">Reason for Visit</p>
                    <p className="font-medium">{selectedAppointment.reasonForVisit}</p>
                  </div>
                )}
                {selectedAppointment.cancellationReason && (
                  <div>
                    <p className="text-sm text-gray-500">Cancellation Reason</p>
                    <p className="font-medium text-red-600">{selectedAppointment.cancellationReason}</p>
                  </div>
                )}
                {selectedAppointment.encounterId && (
                  <div>
                    <p className="text-sm text-gray-500">Linked Encounter</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/doctor/visits/${selectedAppointment.encounterId}`}
                    >
                      View Encounter
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </DoctorLayout>
    </ProtectedDoctorRoute>
  );
};

export default DoctorAppointmentsPage;
