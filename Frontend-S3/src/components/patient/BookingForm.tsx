import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Organization, Doctor, TimeSlot } from '../../types';

interface BookingFormProps {
  clinic: Organization;
  doctor: Doctor;
  slot: TimeSlot;
  onConfirm: (reasonForVisit: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const BookingForm = ({
  clinic,
  doctor,
  slot,
  onConfirm,
  onCancel,
  isLoading,
}: BookingFormProps) => {
  const [reasonForVisit, setReasonForVisit] = useState('');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reasonForVisit);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="bg-white/10 border-purple-500/20">
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Confirm Your Appointment</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Appointment Summary */}
            <div className="bg-purple-500/10 rounded-lg p-4 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-purple-400 text-sm">Clinic</p>
                  <p className="text-white font-medium">{clinic.name}</p>
                  {clinic.address && (
                    <p className="text-purple-300 text-sm mt-1">{clinic.address}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="text-purple-400 text-sm">Doctor</p>
                  <p className="text-white font-medium">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </p>
                  {doctor.specialization && (
                    <p className="text-purple-300 text-sm mt-1">{doctor.specialization}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-purple-400 text-sm">Date & Time</p>
                  <p className="text-white font-medium">{formatDate(slot.date)}</p>
                  <p className="text-purple-300 text-sm mt-1">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Reason for Visit */}
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Reason for Visit (Optional)
              </label>
              <Textarea
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                placeholder="Briefly describe the reason for your visit..."
                rows={3}
                className="bg-white/10 border-purple-500/30 text-white placeholder-purple-400"
              />
              <p className="text-purple-400 text-xs mt-1">
                This helps the doctor prepare for your appointment
              </p>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-yellow-300 font-medium text-sm">Cancellation Policy</p>
                  <p className="text-yellow-400/80 text-sm mt-1">
                    Please cancel at least 24 hours before your appointment. Late cancellations may be marked accordingly.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-purple-500 text-purple-300"
                disabled={isLoading}
              >
                Go Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Booking...
                  </span>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
