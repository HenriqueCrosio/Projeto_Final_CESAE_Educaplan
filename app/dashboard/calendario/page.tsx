'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Calendar as BigCalendar } from 'react-big-calendar';
import { dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import {format} from 'date-fns/format';
import {parse} from 'date-fns/parse';
import {startOfWeek} from 'date-fns/startOfWeek';
import {getDay} from 'date-fns/getDay';
import {enGB} from 'date-fns/locale/en-GB';
import { getMySchedules } from '@/actions/schedule.actions';

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

type Schedule = Awaited<ReturnType<typeof getMySchedules>>[number];

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

const transformToEvents = (schedules: Schedule[]): CalendarEvent[] =>
  schedules.map((s) => {
    const start = new Date(s.dateTime);
    const end = new Date(start.getTime() + s.duration * 60000);
    const courseName = s.lesson.module?.course?.name ?? 'Curso';
    return {
      id: s.id,
      title: `${courseName} — ${s.lesson.name} (${s.class.name})`,
      start,
      end,
    };
  });

type CalendarView = 'month' | 'week' | 'day' | 'agenda';

const CalendarPage = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [view, setView] = useState<CalendarView>('month');
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    getMySchedules().then(setSchedules);
  }, []);

  const events = useMemo(() => transformToEvents(schedules), [schedules]);

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
