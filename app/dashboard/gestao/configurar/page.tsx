/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, FormEvent } from "react";

import { courseService } from "@/services/data-services/course.service";
import { courseWrapperService } from "@/services/wrapper-services/course.wrapper-service";
import { classService } from "@/services/data-services/class.service";
import { createEnrollments } from "@/actions/enrollment.actions";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const EnrollmentPage = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  const [modules, setModules] = useState<any[]>([]);
  const [modulePrices, setModulePrices] = useState<{ [moduleId: string]: number }>({});

  const [totalPrice, setTotalPrice] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      const teacherCourses = await courseService.getCoursesByTeacher();
      setCourses(teacherCourses);
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      const fetchCourseDetails = async () => {
        const courseDetails = await courseWrapperService.getCourseWithModules(selectedCourseId);
        if (courseDetails) {
          setSelectedCourse(courseDetails);
          setModules(courseDetails.modules || []);
          const defaultPrices: { [moduleId: string]: number } = {};
          courseDetails.modules?.forEach((mod: any) => {
            defaultPrices[mod.id] = 0;
          });
          setModulePrices(defaultPrices);
        }
      };
      fetchCourseDetails();
      // Só as turmas deste curso podem ser matriculadas nele.
      classService.getClassesByCourse(selectedCourseId).then((c) => setClasses(c));
      setSelectedClassIds([]);
    } else {
      setSelectedCourse(null);
      setModules([]);
      setClasses([]);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    let priceSum = 0;
    const numClasses = selectedClassIds.length;
    modules.forEach((mod) => {
      const hours = mod.totalHours || 0;
      const pricePerHour = modulePrices[mod.id] || 0;
      priceSum += pricePerHour * hours * numClasses;
    });
    setTotalPrice(priceSum);
  }, [modulePrices, selectedClassIds, modules]);

  const handleModulePriceChange = (moduleId: string, priceEuros: number) => {
    const priceInCents = Math.round(priceEuros * 100);
    setModulePrices((prev) => ({ ...prev, [moduleId]: priceInCents }));
  };

  const handleCreateEnrollment = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return alert("Selecione um curso.");
    if (selectedClassIds.length === 0) return alert("Selecione pelo menos uma turma.");
    if (!startDate || !endDate) return alert("Defina as datas de início e término.");

    setSubmitting(true);
    try {
      const res = await createEnrollments({
        courseId: selectedCourseId,
        classIds: selectedClassIds,
        startDate,
        endDate,
        modulePrices,
        currency: "EUR",
      });
      alert(`${res.count} matrícula(s) criada(s) com sucesso.`);
      setSelectedClassIds([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao criar as matrículas.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Matrículas</h1>
      <form onSubmit={handleCreateEnrollment} className="space-y-6">
        <div>
          <Label htmlFor="courseSelect">Curso</Label>
          <select
            id="courseSelect"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="p-2 border rounded w-full"
          >
            <option value="">-- Selecione um curso --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Início</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label>Data Final</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Turmas do Curso</Label>
              {classes.length === 0 ? (
                <p className="text-gray-500">Nenhuma turma criada para este curso.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {classes.map((cls) => {
                    const studentCount = cls._count?.students ?? 0;
                    return (
                      <div
                        key={cls.id}
                        className={`border p-4 rounded cursor-pointer ${
                          selectedClassIds.includes(cls.id) ? "bg-blue-100" : ""
                        }`}
                        onClick={() =>
                          setSelectedClassIds((prev) =>
                            prev.includes(cls.id)
                              ? prev.filter((id) => id !== cls.id)
                              : [...prev, cls.id]
                          )
                        }
                      >
                        <h3 className="font-bold">{cls.name}</h3>
                        <p className="text-sm text-gray-600">Alunos: {studentCount}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <Label>Módulos do Curso</Label>
              {modules.length === 0 ? (
                <p className="text-gray-500">Não há módulos para este curso.</p>
              ) : (
                <div className="space-y-4">
                  {modules.map((mod) => (
                    <div key={mod.id} className="border p-4 rounded">
                      <p className="font-bold">{mod.name}</p>
                      <p>Duração: {mod.totalHours ?? 0} horas</p>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`price-${mod.id}`}>Preço por Hora (euros):</Label>
                        <Input
                          id={`price-${mod.id}`}
                          type="number"
                          value={modulePrices[mod.id] ? modulePrices[mod.id] / 100 : 0}
                          onChange={(e) => handleModulePriceChange(mod.id, Number(e.target.value))}
                          className="w-24"
                        />
                      </div>
                      <p>
                        Custo deste módulo (por turma):{" "}
                        {formatCurrency((modulePrices[mod.id] || 0) * (mod.totalHours || 0))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Total a Pagar ({selectedClassIds.length} turma(s))</Label>
              <p className="font-bold text-xl">{formatCurrency(totalPrice)}</p>
            </div>
          </>
        )}

        <Button type="submit" className="mt-4" disabled={submitting}>
          {submitting ? "A criar..." : "Criar Matrículas"}
        </Button>
      </form>
    </div>
  );
};

export default EnrollmentPage;
