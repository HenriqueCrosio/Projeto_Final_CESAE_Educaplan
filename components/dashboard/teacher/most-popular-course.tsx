import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Course {
  name: string
}

interface MostPopularCourseProps {
  course: Course
}

export const MostPopularCourse: React.FC<MostPopularCourseProps> = ({ course }) => (
  <Card className="col-span-full">
    <CardHeader>
      <CardTitle>Most Popular Course</CardTitle>
    </CardHeader>
    <CardContent>
      <p>{course.name}</p>
    </CardContent>
  </Card>
)

