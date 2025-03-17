import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CourseCompletionRatesProps {
  rates: { [courseId: string]: number }
}

export const CourseCompletionRates: React.FC<CourseCompletionRatesProps> = ({ rates }) => (
  <Card className="col-span-full">
    <CardHeader>
      <CardTitle>Course Completion Rates</CardTitle>
    </CardHeader>
    <CardContent>
      <ul>
        {Object.entries(rates).map(([courseId, rate]) => (
          <li key={courseId}>
            Course {courseId}: {rate.toFixed(2)}%
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
)

