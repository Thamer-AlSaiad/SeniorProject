import { useState } from 'react';
import { motion } from 'framer-motion';
import { Schedule, ScheduleException, DayOfWeek } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface ScheduleCalendarProps {
  schedules: Schedule[];
  exceptions: ScheduleException[];
  onEditSchedule?: (schedule: Schedule) => void;
  onDeleteSchedule?: (id: string) => void;
  onAddException?: (date: Date) => void;
  onDeleteException?: (id: string) => void;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ScheduleCalendar = ({
  schedules,
  exceptions,
  onEditSchedule,
  onDeleteSchedule,
  onAddException,
  onDeleteException,
}: ScheduleCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const dates = [];
    const current = new Date(startDate);
    while (current <= lastDay || dates.length % 7 !== 0) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const getScheduleForDay = (dayOfWeek: number) => {
    return schedules.filter(s => s.dayOfWeek === dayOfWeek && s.isActive);
  };

  const getExceptionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return exceptions.filter(e => e.exceptionDate.split('T')[0] === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const dates = viewMode === 'week' ? getWeekDates(currentDate) : getMonthDates(currentDate);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-gray-900">Schedule Calendar</h2>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'week' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'month' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={navigatePrev}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={navigateNext}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
          <span className="ml-2 font-medium">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week View */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-7 gap-2">
            {dates.map((date, idx) => {
              const daySchedules = getScheduleForDay(date.getDay());
              const dayExceptions = getExceptionsForDate(date);
              const hasException = dayExceptions.length > 0;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`min-h-[200px] border rounded-lg p-2 ${
                    isToday(date) ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                  } ${isPast(date) ? 'bg-gray-50 opacity-60' : ''}`}
                >
                  <div className="text-center mb-2">
                    <p className="text-xs text-gray-500">{SHORT_DAYS[date.getDay()]}</p>
                    <p className={`text-lg font-semibold ${isToday(date) ? 'text-purple-600' : ''}`}>
                      {date.getDate()}
                    </p>
                  </div>

                  {/* Exceptions */}
                  {dayExceptions.map(exc => (
                    <div
                      key={exc.id}
                      className="mb-2 p-2 bg-red-100 border border-red-200 rounded text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-red-700">Blocked</span>
                        {onDeleteException && (
                          <button
                            onClick={() => onDeleteException(exc.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {exc.startTime && exc.endTime && (
                        <p className="text-red-600">{formatTime(exc.startTime)} - {formatTime(exc.endTime)}</p>
                      )}
                      {exc.reason && <p className="text-red-600 truncate">{exc.reason}</p>}
                    </div>
                  ))}

                  {/* Schedules */}
                  {!hasException && daySchedules.map(schedule => (
                    <div
                      key={schedule.id}
                      className="mb-2 p-2 bg-purple-100 border border-purple-200 rounded text-xs cursor-pointer hover:bg-purple-200"
                      onClick={() => onEditSchedule?.(schedule)}
                    >
                      <p className="font-medium text-purple-700">
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </p>
                      <p className="text-purple-600">{schedule.slotDurationMinutes} min slots</p>
                    </div>
                  ))}

                  {/* Add Exception Button */}
                  {!isPast(date) && onAddException && (
                    <button
                      onClick={() => onAddException(date)}
                      className="w-full mt-1 p-1 text-xs text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                    >
                      + Block time
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Month View */}
        {viewMode === 'month' && (
          <div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {SHORT_DAYS.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {dates.map((date, idx) => {
                const daySchedules = getScheduleForDay(date.getDay());
                const dayExceptions = getExceptionsForDate(date);
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();

                return (
                  <div
                    key={idx}
                    className={`min-h-[80px] border rounded p-1 ${
                      isToday(date) ? 'border-purple-500 bg-purple-50' : 'border-gray-100'
                    } ${!isCurrentMonth ? 'bg-gray-50 opacity-50' : ''}`}
                  >
                    <p className={`text-xs ${isToday(date) ? 'text-purple-600 font-bold' : 'text-gray-600'}`}>
                      {date.getDate()}
                    </p>
                    {dayExceptions.length > 0 && (
                      <Badge variant="error" className="text-[10px] mt-1">Blocked</Badge>
                    )}
                    {dayExceptions.length === 0 && daySchedules.length > 0 && (
                      <Badge variant="info" className="text-[10px] mt-1">
                        {daySchedules.length} slot{daySchedules.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></div>
            <span>Available Schedule</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span>Blocked/Exception</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
