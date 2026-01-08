import { useState } from 'react';
import { motion } from 'framer-motion';
import { Appointment, AppointmentStatus } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Modal } from '../ui/modal';
import { Input } from '../ui/input';

interface AppointmentListProps {
  appointments: Appointment[];
  isLoading?: boolean;
  onCheckIn?: (id: string) => void;
  onStartVisit?: (id: string) => void;
  onComplete?: (id: string) => void;
  onNoShow?: (id: string) => void;
  onCancel?: (id: string, reason: string) => void;
  onViewDetails?: (appointment: Appointment) => void;
}

const statusVariant: Record<AppointmentStatus, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  [AppointmentStatus.SCHEDULED]: 'info',
  [AppointmentStatus.CHECKED_IN]: 'warning',
  [AppointmentStatus.IN_PROGRESS]: 'warning',
  [AppointmentStatus.COMPLETED]: 'success',
  [AppointmentStatus.CANCELLED]: 'error',
  [AppointmentStatus.NO_SHOW]: 'error',
};

const statusLabels: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'Scheduled',
  [AppointmentStatus.CHECKED_IN]: 'Checked In',
  [AppointmentStatus.IN_PROGRESS]: 'In Progress',
  [AppointmentStatus.COMPLETED]: 'Completed',
  [AppointmentStatus.CANCELLED]: 'Cancelled',
  [AppointmentStatus.NO_SHOW]: 'No Show',
};

export const AppointmentList = ({
  appointments,
  isLoading,
  onCheckIn,
  onStartVisit,
  onComplete,
  onNoShow,
  onCancel,
  onViewDetails,
}: AppointmentListProps) => {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = () => {
    if (selectedAppointment && cancelReason.trim() && onCancel) {
      onCancel(selectedAppointment.id, cancelReason);
      setCancelModalOpen(false);
      setSelectedAppointment(null);
      setCancelReason('');
    }
  };

  const getAvailableActions = (appointment: Appointment) => {
    const actions: { label: string; action: () => void; variant: 'primary' | 'outline' | 'danger' }[] = [];

    switch (appointment.status) {
      case AppointmentStatus.SCHEDULED:
        if (onCheckIn) {
          actions.push({ label: 'Check In', action: () => onCheckIn(appointment.id), variant: 'primary' });
        }
        if (onNoShow) {
          actions.push({ label: 'No Show', action: () => onNoShow(appointment.id), variant: 'outline' });
        }
        if (onCancel) {
          actions.push({ label: 'Cancel', action: () => handleCancelClick(appointment), variant: 'danger' });
        }
        break;
      case AppointmentStatus.CHECKED_IN:
        if (onStartVisit) {
          actions.push({ label: 'Start Visit', action: () => onStartVisit(appointment.id), variant: 'primary' });
        }
        if (onCancel) {
          actions.push({ label: 'Cancel', action: () => handleCancelClick(appointment), variant: 'danger' });
        }
        break;
      case AppointmentStatus.IN_PROGRESS:
        if (onComplete) {
          actions.push({ label: 'Complete', action: () => onComplete(appointment.id), variant: 'primary' });
        }
        break;
    }

    return actions;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-gray-500">No appointments found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {appointments.map((appointment, idx) => {
          const actions = getAvailableActions(appointment);

          return (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {appointment.patient?.firstName} {appointment.patient?.lastName}
                        </h3>
                        <Badge variant={statusVariant[appointment.status]}>
                          {statusLabels[appointment.status]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="text-gray-400">Date:</span>{' '}
                          {formatDate(appointment.appointmentDate)}
                        </div>
                        <div>
                          <span className="text-gray-400">Time:</span>{' '}
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </div>
                        {appointment.reasonForVisit && (
                          <div className="col-span-2">
                            <span className="text-gray-400">Reason:</span>{' '}
                            {appointment.reasonForVisit}
                          </div>
                        )}
                      </div>
                      {appointment.cancellationReason && (
                        <p className="mt-2 text-sm text-red-600">
                          <span className="font-medium">Cancellation reason:</span>{' '}
                          {appointment.cancellationReason}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {onViewDetails && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(appointment)}
                        >
                          View
                        </Button>
                      )}
                      {actions.map((action, actionIdx) => (
                        <Button
                          key={actionIdx}
                          variant={action.variant === 'danger' ? 'outline' : action.variant}
                          size="sm"
                          onClick={action.action}
                          className={action.variant === 'danger' ? 'text-red-600 border-red-300 hover:bg-red-50' : ''}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Appointment"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to cancel this appointment with{' '}
            <span className="font-medium">
              {selectedAppointment?.patient?.firstName} {selectedAppointment?.patient?.lastName}
            </span>
            ?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cancellation Reason
            </label>
            <Input
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              Keep Appointment
            </Button>
            <Button
              variant="primary"
              onClick={handleCancelConfirm}
              disabled={!cancelReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancel Appointment
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
