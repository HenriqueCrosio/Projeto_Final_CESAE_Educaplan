/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, FormEvent } from "react";

import { courseService } from "@/services/data-services/course.service";
import { courseWrapperService } from "@/services/wrapper-services/course.wrapper-service";
import { enrollmentWrapperService } from "@/services/wrapper-services/enrollment.wrapper-service";
import { moduleAssignmentService } from "@/services/data-services/assignment.service";
import { classService } from "@/services/data-services/class.service";
import { classStudentService } from "@/services/data-services/class-student.service";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, generateClassName } from "@/lib/utils";

const generateEnrollmentName = (courseName: string): string => {
  const year = new Date().getFullYear();
  return `${courseName} - Enrollment 1/${year}`;
};

const EnrollmentPage = () => {

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const [enrollmentName, setEnrollmentName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  const [modules, setModules] = useState<any[]>([]);
  const [modulePrices, setModulePrices] = useState<{ [moduleId: string]: number }>({});

  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const teacherCourses = courseService.getCoursesByTeacher();
    setCourses(teacherCourses);
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      const courseDetails = courseWrapperService.getCourseWithModules(selectedCourseId);
      if (courseDetails) {
        setSelectedCourse(courseDetails);
        setEnrollmentName(generateEnrollmentName(courseDetails.name));
        setModules(courseDetails.modules || []);
        const defaultPrices: { [moduleId: string]: number } = {};
        courseDetails.modules?.forEach((mod: any) => {
          defaultPrices[mod.id] = 0;
        });
        setModulePrices(defaultPrices);
      }
      const allClasses = classService.getClassesByTeacher();
      setClasses(allClasses);
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
      const hours = mod.totalMinutes / 60;
      const pricePerHour = modulePrices[mod.id] || 0;
      priceSum += pricePerHour * hours * numClasses;
    });
    setTotalPrice(priceSum);
  }, [modulePrices, selectedClassIds, modules]);


  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourseId(e.target.value);
  };

  const handleModulePriceChange = (moduleId: string, priceEuros: number) => {
    const priceInCents = Math.round(priceEuros * 100);
    setModulePrices((prev) => ({ ...prev, [moduleId]: priceInCents }));
  };

  const handleCreateEnrollment = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      alert("Selecione um curso.");
      return;
    }
    if (selectedClassIds.length === 0) {
      alert("Selecione pelo menos uma turma para o enrollment.");
      return;
    }
    if (!startDate || !endDate) {
      alert("Defina as datas de início e término.");
      return;
    }
  
    const teacherId = "cm6bntysq0005s911c7r7o87g";
    const currentYear = new Date().getFullYear();
    
    const renamedClasses = selectedClassIds.map((classId, index) => {
      const newName = generateClassName(index);
      classService.updateClassName(classId, newName);
      return classId;
    });
  
    const enrollmentData = {
      name: enrollmentName,
      courseId: selectedCourseId,
      teacherId,
      createdBy: teacherId,
      classIds: renamedClasses,
      enrollmentYear: currentYear,
      totalPrice,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };
  
    const newEnrollment = enrollmentWrapperService.createEnrollment(enrollmentData);
    if (!newEnrollment) {
      return;
    }
  
    Object.entries(modulePrices).forEach(([moduleId, pricePerHour]) => {
      if (pricePerHour > 0) {
        moduleAssignmentService.addModuleAssignment({
          moduleId,
          enrollementId: newEnrollment.id,
          pricePerHour,
          teacherId,
          currency: "EUR",
        });
      }
    });
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
            onChange={handleCourseChange}
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
                <Label>Identificação da Matrícla</Label>
                <Input
                  type="text"
                  value={enrollmentName}
                  onChange={(e) => setEnrollmentName(e.target.value)}
                />
              </div>
              <div>
                <Label>Data de Início</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Turmas Disponíveis (todas as turmas do sistema)</Label>
              {classes.length === 0 ? (
                <p className="text-gray-500">Nenhuma turma disponível.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {classes.map((cls) => {
                    const studentsInClass = classStudentService.getClassStudentsByClass(cls.id);
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
                        <p className="text-sm text-gray-600">
                          Alunos: {studentsInClass.length}
                        </p>
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
                      <p>
                        Duração: {mod.totalMinutes} minutos (≈{" "}
                        {(mod.totalMinutes / 60).toFixed(2)} horas)
                      </p>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`price-${mod.id}`}>
                          Preço por Hora (euros):
                        </Label>
                        <Input
                          id={`price-${mod.id}`}
                          type="number"
                          value={modulePrices[mod.id] ? modulePrices[mod.id] / 100 : 0}
                          onChange={(e) =>
                            handleModulePriceChange(mod.id, Number(e.target.value))
                          }
                          className="w-24"
                        />
                      </div>
                      <p>
                        Custo deste módulo:{" "}
                        {formatCurrency(
                          (modulePrices[mod.id] || 0) *
                            (mod.totalMinutes / 60) *
                            selectedClassIds.length
                        )}
                      </p>
                      <p>
                        Número de Aulas: {mod.lessonCount || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Total a Pagar</Label>
              <p className="font-bold text-xl">
                {formatCurrency(totalPrice)}
              </p>
            </div>
          </>
        )}

        <Button type="submit" className="mt-4">
          Criar Enrollment
        </Button>
      </form>
    </div>
  );
};

export default EnrollmentPage;
