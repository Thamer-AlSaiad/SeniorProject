import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { CardSkeleton } from '../../components/ui/skeleton';
import { Modal } from '../../components/ui/modal';
import { Input } from '../../components/ui/input';
import { AppointmentCard } from '../../components/patient/AppointmentCard';
import { usePatientBooking } from '../../hooks/usePatientBooking';
import { Appointment, AppointmentStatus } from '../../types';
import { clearAuth } from '../../utils/auth';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: AppointmentStatus.SCHEDULED, label: 'Scheduled' },
  { value: AppointmentStatus.CHECKED_IN, label: 'Checked In' },
  { value: AppointmentStatus.IN_PROGRESS, label: 'In Progress' },
  { value: AppointmentStatus.COMPLETED, label: 'Completed' },
  { value: AppointmentStatus.CANCELLED, label: 'Cancelled' },
  { value: AppointmentStatus.NO_SHOW, label: 'No Show' },
];

const PatientAppointmentsPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const {
    appointments,
    isLoadingAppointments,
    totalPages,
    cancelAppointment,
    isCancelling,
    refetchAppointments,
  } = usePatientBooking({ page, limit: 10, status: statusFilter || undefined });

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/';
  };

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (selectedAppointment && cancelReason.trim()) {
      await cancelAppointment(selectedAppointment.id, cancelReason);
      setShowCancelModal(false);
      setSelectedAppointment(null);
      setCancelReason('');
      refetchAppointments();
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === AppointmentStatus.SCHEDULED || apt.status === AppointmentStatus.CHECKED_IN
  );
  const pastAppointments = appointments.filter(
    (apt) => apt.status !== AppointmentStatus.SCHEDULED && apt.status !== AppointmentStatus.CHECKED_IN
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e]">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 border-b border-purple-500/20">
        <a href="/" className="text-2xl font-bold text-white">EMR System</a>
        <div className="flex-1 flex justify-center items-center gap-8">
          <a href="/patient/booking" className="text-purple-300 hover:text-white transition-colors">
            Book Appointment
          </a>
          <a href="/patient/appointments" className="text-purple-300 hover:text-white transition-colors">
            My Appointments
          </a>
          <a href="/patient/medical-records" className="text-purple-300 hover:text-white transition-colors">
            Medical Records
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a href="/profile">
            <Button variant="outline" className="border-purple-500 text-purple-300">
              Profile
            </Button>
          </a>
          <Button variant="outline" onClick={handleLogout} className="border-purple-500 text-purple-300">
            Log Out
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">My Appointments</h1>
              <p className="text-purple-300 mt-1">View and manage your appointments</p>
            </div>
            <Button
              variant="primary"
              onClick={() => window.location.href = '/patient/booking'}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Book New Appointment
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-white/10 border-purple-500/20">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <label className="text-white text-sm">Filter by status:</label>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-white/10 border-purple-500/30 text-white w-48"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#2d1b4e]">
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {isLoadingAppointments ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : appointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="bg-white/10 border-purple-500/20">
              <CardContent className="py-12 text-center">
                <p className="text-purple-300 text-lg">No appointments found</p>
                <Button
                  variant="primary"
                  onClick={() => window.location.href = '/patient/booking'}
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  Book Your First Appointment
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-white mb-4">Upcoming Appointments</h2>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment, idx) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onCancel={() => handleCancelClick(appointment)}
                      delay={idx * 0.05}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-xl font-semibold text-white mb-4">Past Appointments</h2>
                <div className="space-y-4">
                  {pastAppointments.map((appointment, idx) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      delay={idx * 0.05}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center gap-2 mt-8"
          >
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-purple-500 text-purple-300"
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-white">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="border-purple-500 text-purple-300"
            >
              Next
            </Button>
          </motion.div>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Appointment"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to cancel your appointment with{' '}
            <span className="font-medium">
              Dr. {selectedAppointment?.doctor?.firstName} {selectedAppointment?.doctor?.lastName}
            </span>
            ?
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              Note: Appointments cancelled within 24 hours of the scheduled time may be marked as late-cancelled.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for cancellation
            </label>
            <Input
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Keep Appointment
            </Button>
            <Button
              variant="primary"
              onClick={handleCancelConfirm}
              disabled={!cancelReason.trim() || isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientAppointmentsPage;
