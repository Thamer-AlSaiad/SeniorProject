import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Schedule, CreateScheduleDto, UpdateScheduleDto } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Modal } from '../ui/modal';

interface ScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateScheduleDto | UpdateScheduleDto) => void;
  schedule?: Schedule | null;
  isLoading?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const SLOT_DURATIONS = [
  { value: 15, label: '15 minutes' },
  { value: 20, label: '20 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '60 minutes' },
];

export const ScheduleForm = ({
  isOpen,
  onClose,
  onSubmit,
  schedule,
  isLoading,
}: ScheduleFormProps) => {
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 30,
    effectiveFrom: '',
    effectiveUntil: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (schedule) {
      setFormData({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        slotDurationMinutes: schedule.slotDurationMinutes,
        effectiveFrom: schedule.effectiveFrom?.split('T')[0] || '',
        effectiveUntil: schedule.effectiveUntil?.split('T')[0] || '',
      });
    } else {
      setFormData({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveUntil: '',
      });
    }
    setErrors({});
  }, [schedule, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }
    if (formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Ensure time is in HH:mm format (strip seconds if present)
  const formatTime = (time: string) => {
    if (!time) return time;
    // Handle HH:mm:ss format by taking only HH:mm
    return time.substring(0, 5);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data: CreateScheduleDto | UpdateScheduleDto = {
      dayOfWeek: formData.dayOfWeek,
      startTime: formatTime(formData.startTime),
      endTime: formatTime(formData.endTime),
      slotDurationMinutes: formData.slotDurationMinutes,
      effectiveFrom: formData.effectiveFrom || undefined,
      effectiveUntil: formData.effectiveUntil || undefined,
    };

    onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={schedule ? 'Edit Schedule' : 'Create Schedule'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Day of Week
          </label>
          <Select
            value={formData.dayOfWeek.toString()}
            onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
          >
            {DAYS_OF_WEEK.map(day => (
              <option key={day.value} value={day.value}>{day.label}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <Input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              error={errors.startTime}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <Input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              error={errors.endTime}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slot Duration
          </label>
          <Select
            value={formData.slotDurationMinutes.toString()}
            onChange={(e) => setFormData({ ...formData, slotDurationMinutes: parseInt(e.target.value) })}
          >
            {SLOT_DURATIONS.map(duration => (
              <option key={duration.value} value={duration.value}>{duration.label}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Effective From
            </label>
            <Input
              type="date"
              value={formData.effectiveFrom}
              onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Effective Until (Optional)
            </label>
            <Input
              type="date"
              value={formData.effectiveUntil}
              onChange={(e) => setFormData({ ...formData, effectiveUntil: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : schedule ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
