"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  CurrencyEuroIcon,
  AcademicCapIcon,
  ClockIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

// Dados de exemplo para os gráficos
const performanceData = [
  { name: "Jan", alunos: 4000, aprovados: 2400 },
  { name: "Fev", alunos: 3000, aprovados: 1398 },
  { name: "Mar", alunos: 2000, aprovados: 9800 },
  { name: "Abr", alunos: 2780, aprovados: 3908 },
  { name: "Mai", alunos: 1890, aprovados: 4800 },
  { name: "Jun", alunos: 2390, aprovados: 3800 },
];

const courseDistributionData = [
  { name: "Desenvolvimento Web", value: 400 },
  { name: "Design UX/UI", value: 300 },
  { name: "Marketing Digital", value: 300 },
  { name: "Data Science", value: 200 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface Invoice {
  id: string;
  date: string;
  amount: number;
  course: string;
  hours: number;
  paid: boolean;
}

interface Course {
  id: string;
  name: string;
  totalEarned: number;
  pendingPayment: number;
}

export default function AreaFinanceira() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [courses, setCourses] = useState<Course[]>([
    {
      id: "1",
      name: "Desenvolvimento Web Full Stack",
      totalEarned: 3000,
      pendingPayment: 1000,
    },
    { id: "2", name: "UX/UI Design", totalEarned: 1800, pendingPayment: 600 },
    {
      id: "3",
      name: "Marketing Digital",
      totalEarned: 1200,
      pendingPayment: 400,
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState<Invoice>({
    id: "",
    date: "",
    amount: 0,
    course: "",
    hours: 0,
    paid: false,
  });

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const invoice = { ...newInvoice, id: Date.now().toString() };
    setInvoices([...invoices, invoice]);
    setIsModalOpen(false);
    setNewInvoice({
      id: "",
      date: "",
      amount: 0,
      course: "",
      hours: 0,
      paid: false,
    });

    setCourses(
      courses.map((course) =>
        course.name === invoice.course
          ? {
              ...course,
              pendingPayment: course.pendingPayment + invoice.amount,
            }
          : course
      )
    );
  };

  const toggleInvoicePaid = (id: string) => {
    setInvoices(
      invoices.map((invoice) =>
        invoice.id === id ? { ...invoice, paid: !invoice.paid } : invoice
      )
    );

    const updatedInvoice = invoices.find((inv) => inv.id === id);
    if (updatedInvoice) {
      setCourses(
        courses.map((course) =>
          course.name === updatedInvoice.course
            ? {
                ...course,
                totalEarned: updatedInvoice.paid
                  ? course.totalEarned - updatedInvoice.amount
                  : course.totalEarned + updatedInvoice.amount,
                pendingPayment: updatedInvoice.paid
                  ? course.pendingPayment + updatedInvoice.amount
                  : course.pendingPayment - updatedInvoice.amount,
              }
            : course
        )
      );
    }
  };

  return (
    <div className="p-12 min-h-[calc(100dvh-3.5rem)]">
      <h1 className="text-xl font-bold mb-4">Área Financeira</h1>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
            <CurrencyEuroIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="font-display text-3xl font-semibold leading-none tracking-tight text-foreground">
            €
            {courses
              .reduce((sum, course) => sum + course.totalEarned, 0)
              .toFixed(2)}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">Total Recebido</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/15 dark:text-emerald-400">
            <AcademicCapIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="font-display text-3xl font-semibold leading-none tracking-tight text-foreground">{courses.length}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">Cursos Ativos</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 ring-1 ring-inset ring-amber-500/15 dark:text-amber-400">
            <ClockIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="font-display text-3xl font-semibold leading-none tracking-tight text-foreground">
            €
            {courses
              .reduce((sum, course) => sum + course.pendingPayment, 0)
              .toFixed(2)}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">Total Pendente</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Desempenho Financeiro</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="alunos" fill="#8884d8" />
              <Bar dataKey="aprovados" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">
            Distribuição de Receita por Curso
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={courseDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {courseDistributionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lançamentos e Tabela de Cursos */}
      <div className="rounded-xl border bg-card p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Lançamentos e Cursos</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-foreground text-background px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Lançamento
          </button>
        </div>

        {/* Tabela de Lançamentos */}
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="py-2 px-4 text-left">Data</th>
                <th className="py-2 px-4 text-left">Curso</th>
                <th className="py-2 px-4 text-left">Horas</th>
                <th className="py-2 px-4 text-left">Valor</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b">
                  <td className="py-2 px-4">{invoice.date}</td>
                  <td className="py-2 px-4">{invoice.course}</td>
                  <td className="py-2 px-4">{invoice.hours}</td>
                  <td className="py-2 px-4">€{invoice.amount.toFixed(2)}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded ${
                        invoice.paid
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                      }`}
                    >
                      {invoice.paid ? "Pago" : "Pendente"}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => toggleInvoicePaid(invoice.id)}
                      className={`p-1 rounded ${
                        invoice.paid
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {invoice.paid ? (
                        <XMarkIcon className="h-5 w-5" />
                      ) : (
                        <CheckIcon className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 className="text-lg font-semibold mb-2">Cursos Registrados</h4>
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex justify-between items-center bg-muted p-4 rounded-lg"
            >
              <div>
                <h5 className="font-semibold">{course.name}</h5>
                <p className="text-sm text-muted-foreground">
                  Total Recebido: €{course.totalEarned.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Pendente: €{course.pendingPayment.toFixed(2)}
                </p>
              </div>
              <Button className="bg-foreground text-background text-small px-3 py-1 rounded-lg hover:opacity-90">
                Detalhes
              </Button>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4">
          <div className="bg-card text-card-foreground border p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Novo Lançamento</h2>
            <form onSubmit={handleInvoiceSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground">
                  Data
                </label>
                <input
                  type="date"
                  value={newInvoice.date}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, date: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-input bg-background shadow-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground">
                  Curso
                </label>
                <select
                  value={newInvoice.course}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, course: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-input bg-background shadow-sm"
                  required
                >
                  <option value="">Selecione um curso</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.name}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground">
                  Horas
                </label>
                <input
                  type="number"
                  value={newInvoice.hours}
                  onChange={(e) =>
                    setNewInvoice({
                      ...newInvoice,
                      hours: Number(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-input bg-background shadow-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground">
                  Valor
                </label>
                <input
                  type="number"
                  value={newInvoice.amount}
                  onChange={(e) =>
                    setNewInvoice({
                      ...newInvoice,
                      amount: Number(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-input bg-background shadow-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
