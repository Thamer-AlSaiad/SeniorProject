import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '../ui/card';
import { TimeSlot } from '../../types';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  doctorName: string;
  onSelect: (slot: TimeSlot) => void;
}

export const TimeSlotPicker = ({ slots, doctorName, onSelect }: TimeSlotPickerProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Filter and group slots by date - only show future slots
  const slotsByDate = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    const grouped: Record<string, TimeSlot[]> = {};
    slots.forEach((slot) => {
      const date = slot.date.split('T')[0];
      
      // Skip past dates
      if (date < today) return;
      
      // For today, skip slots that have already passed
      if (date === today && slot.startTime <= currentTime) return;

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });
    // Sort slots within each date by start time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  }, [slots]);

  const dates = Object.keys(slotsByDate).sort();

  // Set initial selected date
  if (!selectedDate && dates.length > 0) {
    setSelectedDate(dates[0]);
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const isTomorrow = (dateStr: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dateStr === tomorrow.toISOString().split('T')[0];
  };

  const getDateLabel = (dateStr: string) => {
    if (isToday(dateStr)) return 'Today';
    if (isTomorrow(dateStr)) return 'Tomorrow';
    return formatDate(dateStr);
  };

  // Count total available slots after filtering
  const totalAvailableSlots = Object.values(slotsByDate).reduce((sum: number, dateSlots: TimeSlot[]) => sum + dateSlots.length, 0);

  if (slots.length === 0 || totalAvailableSlots === 0) {
    return (
      <Card className="bg-white/10 border-purple-500/20">
        <CardContent className="py-12 text-center">
          <p className="text-purple-300 text-lg">No available slots for {doctorName}</p>
          <p className="text-purple-400 text-sm mt-2">
            Please try another doctor or check back later
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-purple-300">
        Select an available time slot with {doctorName}
      </p>

      {/* Date Selector */}
      <Card className="bg-white/10 border-purple-500/20">
        <CardHeader>
          <h3 className="text-white font-semibold">Select Date</h3>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedDate === date
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-purple-300 hover:bg-white/20'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">{getDateLabel(date)}</div>
                  {!isToday(date) && !isTomorrow(date) && (
                    <div className="text-xs opacity-75 mt-0.5">
                      {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  <div className="text-xs mt-1 opacity-75">
                    {slotsByDate[date].length} slot{slotsByDate[date].length !== 1 ? 's' : ''}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDate && (
        <motion.div
          key={selectedDate}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/10 border-purple-500/20">
            <CardHeader>
              <h3 className="text-white font-semibold">
                Available Times for {getDateLabel(selectedDate)}
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {slotsByDate[selectedDate].map((slot, idx) => (
                  <motion.button
                    key={slot.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => onSelect(slot)}
                    className="px-4 py-3 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500 hover:text-white transition-all text-sm font-medium"
                  >
                    {formatTime(slot.startTime)}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
