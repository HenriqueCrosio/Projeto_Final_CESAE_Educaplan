import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Lesson {
  id: string
  name: string
  startTime: string
}

interface UpcomingLessonsProps {
  lessons: Lesson[]
}

export const UpcomingLessons: React.FC<UpcomingLessonsProps> = ({ lessons }) => (
  <Card className="col-span-full">
    <CardHeader>
      <CardTitle>Upcoming Lessons</CardTitle>
    </CardHeader>
    <CardContent>
      <ul>
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            {lesson.id} - {new Date(lesson.startTime).toLocaleString()}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
)

