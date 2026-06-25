import type React from "react"
import { Trophy } from "lucide-react"

interface Course {
  name: string
}

interface MostPopularCourseProps {
  course: Course
}

export const MostPopularCourse: React.FC<MostPopularCourseProps> = ({ course }) => (
  <div className="col-span-full rounded-xl border bg-card p-5 shadow-sm">
    <div className="mb-3 flex items-center gap-2.5">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
        <Trophy className="h-[18px] w-[18px]" />
      </span>
      <h3 className="font-display text-lg font-semibold tracking-tight">Curso mais popular</h3>
    </div>
    <p className="text-base font-medium text-foreground">{course.name}</p>
  </div>
)
