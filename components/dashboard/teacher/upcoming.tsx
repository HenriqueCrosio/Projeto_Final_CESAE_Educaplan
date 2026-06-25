import type React from "react"
import { CalendarClock } from "lucide-react"

interface Lesson {
  id: string
  name: string
  startTime: string
}

interface UpcomingLessonsProps {
  lessons: Lesson[]
}

export const UpcomingLessons: React.FC<UpcomingLessonsProps> = ({ lessons }) => (
  <div className="col-span-full rounded-xl border bg-card p-5 shadow-sm">
    <div className="mb-4 flex items-center gap-2.5">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
        <CalendarClock className="h-[18px] w-[18px]" />
      </span>
      <h3 className="font-display text-lg font-semibold tracking-tight">Próximas aulas</h3>
    </div>
    {lessons.length === 0 ? (
      <p className="text-sm text-muted-foreground">Sem aulas agendadas.</p>
    ) : (
      <ul className="divide-y divide-border">
        {lessons.map((lesson) => (
          <li key={lesson.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
            <span className="font-medium text-foreground">{lesson.name}</span>
            <span className="shrink-0 text-muted-foreground">
              {new Date(lesson.startTime).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
)
