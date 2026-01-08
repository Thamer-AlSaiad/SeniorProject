import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Appointment, AppointmentStatus } from '../../types';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: () => void;
  delay?: number;
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

export const AppointmentCard = ({ appointment, onCancel, delay = 0 }: AppointmentCardProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const canCancel = appointment.status === AppointmentStatus.SCHEDULED;

  const isUpcoming = () => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="bg-white/10 border-purple-500/20 hover:bg-white/15 transition-colors">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Doctor Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold">
                  {appointment.doctor?.firstName?.[0]}{appointment.doctor?.lastName?.[0]}
                </span>
              </div>

              {/* Appointment Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-white">
                    Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                  </h3>
                  <Badge variant={statusVariant[appointment.status]}>
                    {statusLabels[appointment.status]}
                  </Badge>
                </div>

                {appointment.doctor?.specialization && (
                  <p className="text-purple-400 text-sm mt-1">
                    {appointment.doctor.specialization}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-purple-300">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(appointment.appointmentDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                  </span>
                </div>

                {appointment.reasonForVisit && (
                  <p className="text-purple-400 text-sm mt-2">
                    <span className="text-purple-500">Reason:</span> {appointment.reasonForVisit}
                  </p>
                )}

                {appointment.cancellationReason && (
                  <p className="text-red-400 text-sm mt-2">
                    <span className="text-red-500">Cancellation reason:</span> {appointment.cancellationReason}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            {canCancel && isUpcoming() && onCancel && (
              <div className="flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
