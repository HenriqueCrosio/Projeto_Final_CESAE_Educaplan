"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getEnrollmentById } from "@/actions/enrollment.actions"
import { formatCurrency } from "@/lib/utils"

type EnrollmentDetail = Awaited<ReturnType<typeof getEnrollmentById>>

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-md p-4 my-4 shadow-sm bg-white">
      {title && <h2 className="text-lg font-bold mb-2">{title}</h2>}
      {children}
    </div>
  )
}

const statusLabel: Record<string, string> = {
  PENDING: "Pendente",
  ACTIVE: "Ativa",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
}

export default function EnrollmentDetailPage() {
  // A pasta chama-se [slug] por legado, mas o parâmetro é o id da matrícula.
  const params = useParams<{ slug: string }>()
  const id = params?.slug

  const [detail, setDetail] = useState<EnrollmentDetail>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getEnrollmentById(id)
      .then(setDetail)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="p-4"><h1 className="text-xl">A carregar detalhes da matrícula...</h1></div>
  }

  if (!detail) {
    return <div className="p-4"><h1 className="text-xl">Matrícula não encontrada.</h1></div>
  }

  const { enrollment, priceByModule } = detail
  const { course, class: klass } = enrollment

  return (
    <div className="p-4">
      <Card>
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">{course.name}</h1>
          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
            {statusLabel[enrollment.status] ?? enrollment.status}
          </span>
        </div>
        <p className="text-gray-600 mt-1">Turma: {klass.name}</p>
        <p className="text-gray-600">
          {new Date(enrollment.startDate).toLocaleDateString("pt-PT")} —{" "}
          {new Date(enrollment.endDate).toLocaleDateString("pt-PT")}
        </p>
        <p className="text-gray-900 font-semibold mt-2">
          Valor a receber: {formatCurrency(enrollment.totalPrice || 0)}
        </p>
      </Card>

      <Card title="Módulos e preços">
        {course.modules.length === 0 ? (
          <p className="text-gray-500 italic">Este curso não tem módulos.</p>
        ) : (
          <ul className="space-y-2">
            {course.modules.map((mod) => {
              const price = priceByModule[mod.id]
              const hourly = price?.hourlyRate ?? 0
              const subtotal = hourly * (mod.totalHours || 0)
              return (
                <li key={mod.id} className="border rounded p-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">{mod.name}</span>
                    <span className="text-sm text-gray-600">{mod.totalHours ?? 0} h</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Preço/hora: {formatCurrency(hourly)} · Subtotal: {formatCurrency(subtotal)}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Card title="Alunos da turma">
        {klass.students.length === 0 ? (
          <p className="text-gray-500 italic">Nenhum aluno na turma.</p>
        ) : (
          <ul className="list-disc list-inside">
            {klass.students.map((s) => (
              <li key={s.id}>
                {s.user.profile?.displayName?.trim() || s.user.email}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
