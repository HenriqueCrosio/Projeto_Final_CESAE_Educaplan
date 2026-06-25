"use client";

import { useState, useEffect, useCallback } from "react";
import { getMyEnrollments } from "@/actions/enrollment.actions";
import {
  scheduleLesson,
  getSchedulesByClass,
  getUnscheduledLessonsForClass,
} from "@/actions/schedule.actions";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type EnrollmentItem = Awaited<ReturnType<typeof getMyEnrollments>>[number];
type UnscheduledLesson = Awaited<ReturnType<typeof getUnscheduledLessonsForClass>>[number];
type ScheduledItem = Awaited<ReturnType<typeof getSchedulesByClass>>[number];

export default function SchedulePage() {
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>("");

  const [unscheduled, setUnscheduled] = useState<UnscheduledLesson[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledItem[]>([]);

  const [selectedLesson, setSelectedLesson] = useState<UnscheduledLesson | null>(null);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyEnrollments().then((list) => {
      setEnrollments(list);
      if (list.length > 0) setSelectedEnrollmentId((prev) => prev || list[0].id);
    });
  }, []);

  const currentEnrollment = enrollments.find((e) => e.id === selectedEnrollmentId);
  const classId = currentEnrollment?.classId;

  const refresh = useCallback(async (cid: string) => {
    const [u, s] = await Promise.all([
      getUnscheduledLessonsForClass(cid),
      getSchedulesByClass(cid),
    ]);
    setUnscheduled(u);
    setScheduled(s);
  }, []);

  useEffect(() => {
    if (classId) {
      refresh(classId);
      setSelectedLesson(null);
    } else {
      setUnscheduled([]);
      setScheduled([]);
    }
  }, [classId, refresh]);

  // Agrupa as aulas por agendar por módulo.
  const lessonsByModule = unscheduled.reduce<Record<string, { name: string; lessons: UnscheduledLesson[] }>>(
    (acc, lesson) => {
      const key = lesson.module.id;
      if (!acc[key]) acc[key] = { name: lesson.module.name, lessons: [] };
      acc[key].lessons.push(lesson);
      return acc;
    },
    {}
  );

  const handleSchedule = async () => {
    if (!classId || !selectedLesson || !startDate || !startTime) return;
    setSaving(true);
    try {
      await scheduleLesson({
        classId,
        lessonId: selectedLesson.id,
        dateTime: new Date(`${startDate}T${startTime}`),
        duration: Math.round(selectedLesson.duration),
      });
      setSelectedLesson(null);
      setStartDate("");
      setStartTime("09:00");
      await refresh(classId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao agendar a aula.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Marcação de aulas</h1>

      {enrollments.length === 0 ? (
        <p className="text-gray-600">Nenhuma matrícula. Cria uma matrícula primeiro em &quot;Criar matrícula&quot;.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 border-b mb-4 pb-2">
            {enrollments.map((enr) => (
              <Button
                key={enr.id}
                variant={enr.id === selectedEnrollmentId ? "default" : "ghost"}
                onClick={() => setSelectedEnrollmentId(enr.id)}
              >
                {enr.course.name} — {enr.class.name}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Aulas por agendar</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(lessonsByModule).length === 0 ? (
                  <p className="italic text-gray-500">Todas as aulas já estão agendadas (ou não há aulas).</p>
                ) : (
                  Object.entries(lessonsByModule).map(([moduleId, group]) => (
                    <div key={moduleId} className="mb-4 p-2 border rounded">
                      <h3 className="font-semibold mb-2">{group.name}</h3>
                      <ul className="space-y-1">
                        {group.lessons.map((lesson) => (
                          <li key={lesson.id}>
                            <Button
                              variant="ghost"
                              onClick={() => setSelectedLesson(lesson)}
                              className={`text-left ${
                                selectedLesson?.id === lesson.id ? "font-bold text-primary" : ""
                              }`}
                            >
                              {lesson.name} ({Math.round(lesson.duration)} min)
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Agendar aula</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium">Aula selecionada</label>
                    <Input type="text" value={selectedLesson?.name ?? ""} readOnly className="mt-1 bg-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Data</label>
                    <Input type="date" className="mt-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Hora</label>
                    <Input type="time" className="mt-1" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  </div>
                  <Button onClick={handleSchedule} disabled={!selectedLesson || !startDate || saving}>
                    {saving ? "A agendar..." : "Agendar aula"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Aulas agendadas</CardTitle>
                </CardHeader>
                <CardContent>
                  {scheduled.length === 0 ? (
                    <p className="italic text-gray-500">Nenhuma aula agendada para esta turma.</p>
                  ) : (
                    <ul className="space-y-1">
                      {scheduled.map((s) => (
                        <li key={s.id} className="flex justify-between text-sm border-b last:border-0 py-1">
                          <span>{s.lesson.name}</span>
                          <span className="text-green-700">{formatDateTime(s.dateTime)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
