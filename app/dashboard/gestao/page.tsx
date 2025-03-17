/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React from "react"
import Link from "next/link"
import { useCentralStore } from "@/store/central.store"
import { formatCurrency } from "@/lib/utils"
import type { Enrollment } from "@/types/interfaces"

const formatDate = (dateInput: string | Date): string => {
  const date = new Date(dateInput)
  return date.toLocaleDateString("pt-PT")
}

const EnrollmentListPage = () => {
  const enrollments = useCentralStore((state) => state.getData("enrollments") || [])

  const [upcomingEnrollments, ongoingEnrollments, pastEnrollments] = React.useMemo(() => {
    const now = new Date()
    const upcoming: Enrollment[] = []
    const ongoing: Enrollment[] = []
    const past: Enrollment[] = []

    enrollments.forEach((enr: Enrollment) => {
      const start = new Date(enr.startDate)
      const end = new Date(enr.endDate)

      if (start > now) {
        upcoming.push(enr)
      } else if (end < now) {
        past.push(enr)
      } else {
        ongoing.push(enr)
      }
    })

    return [upcoming, ongoing, past]
  }, [enrollments])

  const EnrollmentGroup = ({ title, enrollments }: { title: string; enrollments: Enrollment[] }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>
      {enrollments.length === 0 ? (
        <p className="text-gray-500">Nenhuma matrícula nesta categoria.</p>
      ) : (
        <ul className="space-y-6">
          {enrollments.map((enr: Enrollment) => (
            <li key={enr.id} className="block">
              <Link href={`/dashboard/gestao/planos/${enr.slug}`} className="block">
                <div className="border p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
                  <h3 className="font-bold text-lg mb-3">{enr.name}</h3>
                  <div className="space-y-2">
                    <p>
                      <strong>Curso:</strong> {enr.courseId}
                    </p>
                    <p>
                      <strong>Data de Início:</strong> {formatDate(enr.startDate)}
                    </p>
                    <p>
                      <strong>Data de Término:</strong> {formatDate(enr.endDate)}
                    </p>
                    <p>
                      <strong>Valor a receber:</strong> {formatCurrency(enr.totalPrice || 0)}
                    </p>
                    <p>
                      <strong>Turmas:</strong>{" "}
                      {enr.classIds && enr.classIds.length > 0 ? enr.classIds.join(", ") : "Nenhuma turma associada"}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  return (
    <div className="space-y-12 p-8">
      <h1 className="text-3xl font-bold mb-8">Lista de Matrículas</h1>

      <EnrollmentGroup title="Enrollments Futuros" enrollments={upcomingEnrollments} />
      <EnrollmentGroup title="Enrollments em Andamento" enrollments={ongoingEnrollments} />
      <EnrollmentGroup title="Enrollments Passados" enrollments={pastEnrollments} />
    </div>
  )
}

export default EnrollmentListPage

