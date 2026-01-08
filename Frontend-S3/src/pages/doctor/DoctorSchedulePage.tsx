import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProtectedDoctorRoute } from '../../components/doctor/ProtectedDoctorRoute';
import { DoctorLayout } from '../../components/doctor/DoctorLayout';
import { ScheduleCalendar } from '../../components/doctor/ScheduleCalendar';
import { ScheduleForm } from '../../components/doctor/ScheduleForm';
import { ExceptionForm } from '../../components/doctor/ExceptionForm';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CardSkeleton } from '../../components/ui/skeleton';
import {
  useSchedules,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useGenerateSlots,
  useUpcomingExceptions,
  useCreateScheduleException,
  useDeleteScheduleException,
} from '../../hooks';
import { Schedule, CreateScheduleDto, UpdateScheduleDto, CreateScheduleExceptionDto } from '../../types';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DoctorSchedulePage = () => {
  const [scheduleFormOpen, setScheduleFormOpen] = useState(false);
  const [exceptionFormOpen, setExceptionFormOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [generateSlotsModal, setGenerateSlotsModal] = useState(false);
  const [generateScheduleId, setGenerateScheduleId] = useState<string | null>(null);
  const [generateFromDate, setGenerateFromDate] = useState('');
  const [generateToDate, setGenerateToDate] = useState('');

  const { data: schedulesData, isLoading: loadingSchedules } = useSchedules();
  const { data: exceptionsData, isLoading: loadingExceptions } = useUpcomingExceptions();

  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const generateSlots = useGenerateSlots();
  const createException = useCreateScheduleException();
  const deleteException = useDeleteScheduleException();

  const schedules = schedulesData?.data || [];
  const exceptions = exceptionsData?.data || [];

  const handleCreateSchedule = () => {
    setSelectedSchedule(null);
    setScheduleFormOpen(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setScheduleFormOpen(true);
  };

  const handleScheduleSubmit = (data: CreateScheduleDto | UpdateScheduleDto) => {
    if (selectedSchedule) {
      updateSchedule.mutate(
        { id: selectedSchedule.id, data },
        { onSuccess: () => setScheduleFormOpen(false) }
      );
    } else {
      createSchedule.mutate(data as CreateScheduleDto, {
        onSuccess: () => setScheduleFormOpen(false),
      });
    }
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      deleteSchedule.mutate(id);
    }
  };

  const handleAddException = (date: Date) => {
    setSelectedDate(date);
    setExceptionFormOpen(true);
  };

  const handleExceptionSubmit = (data: CreateScheduleExceptionDto) => {
    createException.mutate(data, {
      onSuccess: () => setExceptionFormOpen(false),
    });
  };

  const handleDeleteException = (id: string) => {
    if (confirm('Are you sure you want to remove this time block?')) {
      deleteException.mutate(id);
    }
  };

  const handleOpenGenerateSlots = (scheduleId: string) => {
    setGenerateScheduleId(scheduleId);
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setGenerateFromDate(today.toISOString().split('T')[0]);
    setGenerateToDate(nextMonth.toISOString().split('T')[0]);
    setGenerateSlotsModal(true);
  };

  const handleGenerateSlots = () => {
    if (generateScheduleId && generateFromDate && generateToDate) {
      generateSlots.mutate(
        {
          id: generateScheduleId,
          data: { fromDate: generateFromDate, toDate: generateToDate },
        },
        { onSuccess: () => setGenerateSlotsModal(false) }
      );
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
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
              <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
              <p className="text-gray-500">Define your availability and manage time blocks</p>
            </div>
            <Button onClick={handleCreateSchedule}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Schedule
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Schedule List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <Card>
                <CardHeader>
                  <h2 className="font-semibold text-gray-900">Weekly Schedules</h2>
                </CardHeader>
                <CardContent>
                  {loadingSchedules ? (
                    <div className="space-y-4">
                      <CardSkeleton />
                      <CardSkeleton />
                    </div>
                  ) : schedules.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No schedules defined yet</p>
                      <Button variant="outline" onClick={handleCreateSchedule}>
                        Create your first schedule
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {schedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {DAYS_OF_WEEK[schedule.dayOfWeek]}
                            </span>
                            <Badge variant={schedule.isActive ? 'success' : 'default'}>
                              {schedule.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                          </p>
                          <p className="text-xs text-gray-500 mb-3">
                            {schedule.slotDurationMinutes} min slots
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSchedule(schedule)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenGenerateSlots(schedule.id)}
                            >
                              Generate Slots
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Exceptions */}
              <Card className="mt-6">
                <CardHeader>
                  <h2 className="font-semibold text-gray-900">Upcoming Time Blocks</h2>
                </CardHeader>
                <CardContent>
                  {loadingExceptions ? (
                    <CardSkeleton />
                  ) : exceptions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No upcoming time blocks</p>
                  ) : (
                    <div className="space-y-2">
                      {exceptions.slice(0, 5).map((exception) => (
                        <div
                          key={exception.id}
                          className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-red-700">
                              {new Date(exception.exceptionDate).toLocaleDateString()}
                            </p>
                            {exception.startTime && exception.endTime ? (
                              <p className="text-xs text-red-600">
                                {formatTime(exception.startTime)} - {formatTime(exception.endTime)}
                              </p>
                            ) : (
                              <p className="text-xs text-red-600">Full day</p>
                            )}
                            {exception.reason && (
                              <p className="text-xs text-red-500">{exception.reason}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteException(exception.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Calendar View */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <ScheduleCalendar
                schedules={schedules}
                exceptions={exceptions}
                onEditSchedule={handleEditSchedule}
                onDeleteSchedule={handleDeleteSchedule}
                onAddException={handleAddException}
                onDeleteException={handleDeleteException}
              />
            </motion.div>
          </div>
        </div>

        {/* Schedule Form Modal */}
        <ScheduleForm
          isOpen={scheduleFormOpen}
          onClose={() => setScheduleFormOpen(false)}
          onSubmit={handleScheduleSubmit}
          schedule={selectedSchedule}
          isLoading={createSchedule.isPending || updateSchedule.isPending}
        />

        {/* Exception Form Modal */}
        <ExceptionForm
          isOpen={exceptionFormOpen}
          onClose={() => setExceptionFormOpen(false)}
          onSubmit={handleExceptionSubmit}
          initialDate={selectedDate}
          isLoading={createException.isPending}
        />

        {/* Generate Slots Modal */}
        {generateSlotsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Generate Time Slots</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={generateFromDate}
                    onChange={(e) => setGenerateFromDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={generateToDate}
                    onChange={(e) => setGenerateToDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setGenerateSlotsModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateSlots}
                    disabled={generateSlots.isPending}
                  >
                    {generateSlots.isPending ? 'Generating...' : 'Generate Slots'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DoctorLayout>
    </ProtectedDoctorRoute>
  );
};

export default DoctorSchedulePage;
