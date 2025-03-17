'use client';

import React, { useMemo, useState } from 'react';
import { Calendar as BigCalendar } from 'react-big-calendar';
import { dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import {format} from 'date-fns/format';
import {parse} from 'date-fns/parse';
import {startOfWeek} from 'date-fns/startOfWeek';
import {getDay} from 'date-fns/getDay';
import {enGB} from 'date-fns/locale/en-GB';
import { TeacherDashboardService } from '@/services/wrapper-services/teacher.wrapper-service';
import { useTeacherStats } from '@/lib/hooks/use-teacher-stats';

const locales = {
  'en-GB': enGB,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export interface ClassScheduleLessons {
  id: string;
  classId: string;
  lessonId: string;
  courseId: string;
  moduleId: string;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
  enrollmentId: string;
  duration: number;
  startTime: Date;
  endTime?: Date;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

const transformLessonsToEvents = (lessons: ClassScheduleLessons[]): CalendarEvent[] => {
  return lessons.map(lesson => {
    const start = new Date(lesson.startTime);
    const end = lesson.endTime ? new Date(lesson.endTime) : new Date(start.getTime() + lesson.duration * 60000);
    const title = `Curso: ${lesson.courseId} - Lição: ${lesson.lessonId}`;
    return {
      id: lesson.id,
      title,
      start,
      end,
    };
  });
};

type CalendarView = 'month' | 'week' | 'day' | 'agenda';

const CalendarPage = () => {
  
  const lessonsData: ClassScheduleLessons[] = TeacherDashboardService.getInstance().getTeacherScheduledLessons();

  const events = useMemo(() => transformLessonsToEvents(lessonsData), [lessonsData]);

  const [view, setView] = useState<CalendarView>('month');

  const [date, setDate] = useState(new Date());

  return (
    <div className="container mx-auto p-4">
      <BigCalendar
        localizer={localizer}
        events={events}
        view={view}
        date={date}
        onNavigate={(newDate) => setDate(newDate)}
        onView={(newView) => setView(newView as CalendarView)}
        style={{ height: '80vh' }}
      />
    </div>
  );
};

export default CalendarPage;
