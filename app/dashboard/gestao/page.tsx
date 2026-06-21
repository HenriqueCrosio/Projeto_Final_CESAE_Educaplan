"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { getMyEnrollments } from "@/actions/enrollment.actions"
import { formatCurrency } from "@/lib/utils"

type EnrollmentItem = Awaited<ReturnType<typeof getMyEnrollments>>[number]

const formatDate = (dateInput: string | Date): string =>
  new Date(dateInput).toLocaleDateString("pt-PT")

const statusLabel: Record<string, string> = {
  PENDING: "Pendente",
  ACTIVE: "Ativa",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
}

const EnrollmentListPage = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyEnrollments()
      .then(setEnrollments)
      .finally(() => setLoading(false))
  }, [])

  const [upcoming, ongoing, past] = React.useMemo(() => {
    const now = new Date()
    const up: EnrollmentItem[] = []
    const on: EnrollmentItem[] = []
    const pa: EnrollmentItem[] = []
    enrollments.forEach((enr) => {
      const start = new Date(enr.startDate)
      const end = new Date(enr.endDate)
      if (start > now) up.push(enr)
      else if (end < now) pa.push(enr)
      else on.push(enr)
    })
    return [up, on, pa]
  }, [enrollments])

  const EnrollmentGroup = ({ title, items }: { title: string; items: EnrollmentItem[] }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>
      {items.length === 0 ? (
        <p className="text-gray-500">Nenhuma matrícula nesta categoria.</p>
      ) : (
        <ul className="space-y-6">
          {items.map((enr) => (
            <li key={enr.id} className="block">
              <Link href={`/dashboard/gestao/planos/${enr.id}`} className="block">
                <div className="border p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg">{enr.course.name}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {statusLabel[enr.status] ?? enr.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p><strong>Turma:</strong> {enr.class.name}</p>
                    <p><strong>Início:</strong> {formatDate(enr.startDate)}</p>
                    <p><strong>Fim:</strong> {formatDate(enr.endDate)}</p>
                    <p><strong>Valor a receber:</strong> {formatCurrency(enr.totalPrice || 0)}</p>
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
      <h1 className="text-3xl font-bold">Matrículas</h1>
      {loading ? (
        <p className="text-gray-600">A carregar matrículas...</p>
      ) : (
        <>
          <EnrollmentGroup title="A Decorrer" items={ongoing} />
          <EnrollmentGroup title="Próximas" items={upcoming} />
          <EnrollmentGroup title="Finalizadas" items={past} />
        </>
      )}
    </div>
  )
}

export default EnrollmentListPage
