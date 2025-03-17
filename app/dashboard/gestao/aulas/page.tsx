"use client";

import { useState, useEffect } from "react";
import { scheduleService } from "@/services/wrapper-services/enrollment-schedule.wrapper-service";
import type { Enrollment, Lesson, Class, ClassScheduleLessons } from "@/types/interfaces";
import { useCentralStore } from "@/store/central.store";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SchedulePage() {
  const data = useCentralStore((state) => state.data);
  const { enrollments, classes, modules, moduleLessons } = data;

  const [selectedEnrollmentSlug, setSelectedEnrollmentSlug] = useState<string>("");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState("09:00");
  const [scheduledLessons, setScheduledLessons] = useState<ClassScheduleLessons[]>([]);

  useEffect(() => {
    if (enrollments.length > 0 && !selectedEnrollmentSlug) {
      setSelectedEnrollmentSlug(enrollments[0].slug);
    }
  }, [enrollments, selectedEnrollmentSlug]);

  useEffect(() => {
    if (selectedEnrollmentSlug) {
      fetchScheduledLessons();
    }
  }, [selectedEnrollmentSlug]);

  const fetchScheduledLessons = () => {
    if (!selectedEnrollmentSlug) return;
    const enrollment = data.enrollments.find((e) => e.slug === selectedEnrollmentSlug);
    if (!enrollment) return;

    const courseModule = data.courseModules.find((cm) => cm.courseId === enrollment.courseId);
    if (!courseModule) return;

    const scheduled = scheduleService.getScheduledLessons(selectedEnrollmentSlug, courseModule.moduleId);
    setScheduledLessons(scheduled);
  };

  const unlecturedLessons = selectedEnrollmentSlug
    ? scheduleService.getUnlecturedLessonsForEnrollment(selectedEnrollmentSlug)
    : [];

  const lessonsByModule: Record<string, Lesson[]> = {};
  unlecturedLessons.forEach((lesson) => {
    const moduleLesson = moduleLessons.find((ml) => ml.lessonId === lesson.id);
    if (moduleLesson) {
      const moduleId = moduleLesson.moduleId;
      if (!lessonsByModule[moduleId]) {
        lessonsByModule[moduleId] = [];
      }
      lessonsByModule[moduleId].push(lesson);
    }
  });

  const handleSchedule = () => {
    if (!selectedEnrollmentSlug || !selectedLesson || !selectedClassId || !startDate || !startTime) {
      return;
    }

    const moduleLesson = moduleLessons.find((ml) => ml.lessonId === selectedLesson?.id);
    if (!moduleLesson) {
      return;
    }

    const scheduledLesson = scheduleService.applyScheduleToLesson(
      selectedEnrollmentSlug,
      moduleLesson.moduleId,
      selectedClassId,
      selectedLesson.id,
      startDate,
      startTime
    );

    if (scheduledLesson) {
      setScheduledLessons([...scheduledLessons, scheduledLesson]);
      setSelectedLesson(null);
      setStartDate(null);
      setStartTime("09:00");
    }
  };

  const currentEnrollment: Enrollment | undefined = enrollments.find((e) => e.slug === selectedEnrollmentSlug);

  return (
    <div className="p-4">
      <div className="flex space-x-4 border-b mb-4">
        {enrollments.map((enr) => (
          <Button
            key={enr.slug}
            variant={enr.slug === selectedEnrollmentSlug ? "default" : "ghost"}
            onClick={() => setSelectedEnrollmentSlug(enr.slug)}
          >
            {enr.name}
          </Button>
        ))}
      </div>

      {!currentEnrollment ? (
        <p className="text-gray-600">No enrollment selected or no enrollments exist.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Unlectured Lessons for {currentEnrollment.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(lessonsByModule).length === 0 ? (
                  <p className="italic text-gray-500">No unlectured lessons found.</p>
                ) : (
                  Object.entries(lessonsByModule).map(([moduleId, lessons]) => {
                    const mod = modules.find((m) => m.id === moduleId);
                    return (
                      <div key={moduleId} className="mb-4 p-2 border rounded">
                        <h3 className="font-semibold mb-2">{mod ? mod.name : `Module ${moduleId}`}</h3>
                        <ul className="list-disc list-inside">
                          {lessons.map((lesson: Lesson) => {
                            const scheduledLesson = scheduledLessons.find((s) => s.lessonId === lesson.id);
                            return (
                              <li key={lesson.id} className="ml-4 flex justify-between">
                                <Button
                                  variant="ghost"
                                  onClick={() => setSelectedLesson(lesson)}
                                  className={`text-left ${
                                    selectedLesson?.id === lesson.id ? "font-bold text-blue-600" : ""
                                  }`}
                                >
                                  {lesson.name} ({lesson.duration} min)
                                </Button>
                                {scheduledLesson ? (
                                  <span className="text-green-600 text-sm">
                                    {formatDateTime(scheduledLesson.startTime)}
                                  </span>
                                ) : (
                                  <span className="text-gray-500 text-sm">Not Scheduled</span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Schedule a Lesson</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <label className="block text-sm font-medium">Selected Lesson</label>
                  <Input type="text" value={selectedLesson ? selectedLesson.name : ""} readOnly className="mt-1 bg-gray-100" />
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium">Class</label>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls: Class) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium">Start Date</label>
                  <Input type="date" className="mt-1" onChange={(e) => setStartDate(new Date(e.target.value))} />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium">Start Time</label>
                  <Input type="time" className="mt-1" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>

                <Button onClick={handleSchedule} disabled={!selectedLesson}>
                  Schedule Lesson
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
