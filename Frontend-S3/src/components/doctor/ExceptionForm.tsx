import { useState, useEffect, FormEvent } from 'react';
import { CreateScheduleExceptionDto } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Modal } from '../ui/modal';
import { Checkbox } from '../ui/checkbox';

interface ExceptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateScheduleExceptionDto) => void;
  initialDate?: Date | null;
  isLoading?: boolean;
}

export const ExceptionForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialDate,
  isLoading,
}: ExceptionFormProps) => {
  const [formData, setFormData] = useState({
    exceptionDate: '',
    isFullDay: true,
    startTime: '09:00',
    endTime: '17:00',
    reason: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialDate) {
      setFormData(prev => ({
        ...prev,
        exceptionDate: initialDate.toISOString().split('T')[0],
      }));
    } else {
      setFormData({
        exceptionDate: new Date().toISOString().split('T')[0],
        isFullDay: true,
        startTime: '09:00',
        endTime: '17:00',
        reason: '',
      });
    }
    setErrors({});
  }, [initialDate, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.exceptionDate) {
      newErrors.exceptionDate = 'Date is required';
    }

    if (!formData.isFullDay) {
      if (!formData.startTime) {
        newErrors.startTime = 'Start time is required';
      }
      if (!formData.endTime) {
        newErrors.endTime = 'End time is required';
      }
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data: CreateScheduleExceptionDto = {
      exceptionDate: formData.exceptionDate,
      startTime: formData.isFullDay ? undefined : formData.startTime,
      endTime: formData.isFullDay ? undefined : formData.endTime,
      reason: formData.reason || undefined,
    };

    onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Block Time">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <Input
            type="date"
            value={formData.exceptionDate}
            onChange={(e) => setFormData({ ...formData, exceptionDate: e.target.value })}
            error={errors.exceptionDate}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="fullDay"
            checked={formData.isFullDay}
            onChange={(e) => setFormData({ ...formData, isFullDay: e.target.checked })}
          />
          <label htmlFor="fullDay" className="text-sm text-gray-700">
            Block entire day
          </label>
        </div>

        {!formData.isFullDay && (
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
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason (Optional)
          </label>
          <Input
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="e.g., Vacation, Meeting, Personal"
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Creating this exception may affect existing appointments.
            Patients with appointments during this time will be notified.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Block Time'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
