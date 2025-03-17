/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, CSSProperties } from 'react'
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const localizer = momentLocalizer(moment)

interface CalendarEvent {
  id: number
  title: string
  start: Date
  end: Date
  moduleName: string
  courseId: string
}

interface ScheduleCalendarProps {
  events: CalendarEvent[]
  inactiveHours: { start: string; end: string }
  emergencyHours: { start: string; end: string }
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  events,
  inactiveHours,
  emergencyHours,
}) => {
  const [view, setView] = useState<View>(Views.WEEK)
  const [date, setDate] = useState(new Date())
  const [range, setRange] = useState('3months')

  // ✅ Force re-render when switching views
  const [calendarKey, setCalendarKey] = useState(0)

  const handleViewChange = (newView: View) => {
    setView(newView)
    setCalendarKey((prev) => prev + 1) // Force re-render
  }

  // ✅ Handle range changes for the calendar
  const handleRangeChange = (newRange: string) => {
    setRange(newRange)
    const today = new Date()
    switch (newRange) {
      case '3months':
        setDate(moment(today).add(3, 'months').toDate())
        break
      case '6months':
        setDate(moment(today).add(6, 'months').toDate())
        break
      case '1year':
        setDate(moment(today).add(1, 'year').toDate())
        break
    }
  }

  const eventStyleGetter = (event: CalendarEvent): { className?: string; style?: CSSProperties } => ({
    style: {
      backgroundColor: `hsl(${parseInt(event.courseId) * 100}, 70%, 50%)`,
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: 'none',
      display: 'flex',
      flexDirection: 'column' as const, 
      padding: '4px 8px',
      fontSize: '12px',
      lineHeight: '16px',
      overflow: 'hidden',
    },
  })

  const dayPropGetter = (date: Date) => {
    const currentTime = date.getHours() + date.getMinutes() / 60

    const [emergencyStartHour, emergencyStartMinute] = emergencyHours.start.split(':').map(Number)
    const [emergencyEndHour, emergencyEndMinute] = emergencyHours.end.split(':').map(Number)
    const emergencyStartTime = emergencyStartHour + emergencyStartMinute / 60
    const emergencyEndTime = emergencyEndHour + emergencyEndMinute / 60

    if (currentTime >= emergencyStartTime && currentTime < emergencyEndTime) {
      return {
        className: 'emergency-hours',
        style: {
          backgroundColor: '#FAFAFA',
        },
      }
    }
    return {}
  }

  // ✅ Fix button comparison logic and add Agenda button
  return (
    <div className="h-full flex flex-col -m-6">
      <div className="flex justify-between items-center mb-4 px-6 pt-6">
        <div className="space-x-2">
          <Button
            onClick={() => handleViewChange(Views.WEEK)}
            variant={view === Views.WEEK ? 'default' : 'outline'}
          >
            Week
          </Button>
          <Button
            onClick={() => handleViewChange(Views.MONTH)}
            variant={view === Views.MONTH ? 'default' : 'outline'}
          >
            Month
          </Button>
          <Button
            onClick={() => handleViewChange(Views.AGENDA)}
            variant={view === Views.AGENDA ? 'default' : 'outline'}
          >
            Agenda
          </Button>
        </div>
        <Select value={range} onValueChange={handleRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">3 Months</SelectItem>
            <SelectItem value="6months">6 Months</SelectItem>
            <SelectItem value="1year">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-grow">
        <Calendar
          key={calendarKey} // ✅ Fix: Force re-render when switching views
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view}
          onView={(newView) => handleViewChange(newView as View)}
          views={{ month: true, week: true, day: true, agenda: true }} // ✅ Ensure views are explicitly passed
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
          className="px-6 pb-6"
        />
      </div>
    </div>
  )
}





