"use client"

import { useState, useEffect, type FormEvent } from "react"

import { addStudent, getMyStudents } from "@/actions/student.actions"
import { classService } from "@/services/data-services/class.service"
import { courseService } from "@/services/data-services/course.service"
import { getClassById } from "@/actions/class.actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { generateRandomColor, validateEmail } from "@/lib/utils"

type StudentItem = Awaited<ReturnType<typeof getMyStudents>>[number]
type ClassWithStudents = NonNullable<Awaited<ReturnType<typeof getClassById>>>
type CourseOption = { id: string; name: string }

const studentLabel = (s: StudentItem) =>
  s.user.profile?.displayName?.trim() || s.user.email

const ManageStudentsAndClassesPage = () => {
  const [students, setStudents] = useState<StudentItem[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState("")

  const [studentUsername, setStudentUsername] = useState("")
  const [studentDomain, setStudentDomain] = useState("gmail.com")
  const [studentLoading, setStudentLoading] = useState(false)

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [confirmedClasses, setConfirmedClasses] = useState<ClassWithStudents[]>([])
  const [visibleClassStudents, setVisibleClassStudents] = useState<{ [key: string]: boolean }>({})
  const [confirmLoading, setConfirmLoading] = useState(false)

  const generateTurmaName = () => `Turma ${Date.now()}`
  const [turmaName, setTurmaName] = useState(generateTurmaName())
  const [turmaColor, setTurmaColor] = useState(generateRandomColor())

  useEffect(() => {
    const load = async () => {
      const [fetchedStudents, fetchedCourses] = await Promise.all([
        getMyStudents(),
        courseService.getCoursesByTeacher(),
      ])
      setStudents(fetchedStudents)
      setCourses(fetchedCourses.map((c: CourseOption) => ({ id: c.id, name: c.name })))
    }
    load()
  }, [])

  const availableStudents = students.filter((s) => !selectedStudentIds.includes(s.id))
  const selectedStudents = students.filter((s) => selectedStudentIds.includes(s.id))

  const handleAddStudent = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedUsername = studentUsername.trim().toLowerCase()
    const trimmedDomain = studentDomain.trim().toLowerCase()
    if (!trimmedUsername) return
    const fullEmail = trimmedUsername.includes("@") ? trimmedUsername : `${trimmedUsername}@${trimmedDomain}`
    if (!validateEmail(fullEmail)) return

    setStudentLoading(true)
    try {
      await addStudent({ email: fullEmail })
      const refreshed = await getMyStudents()
      setStudents(refreshed)
      setStudentUsername("")
    } finally {
      setStudentLoading(false)
    }
  }

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  const handleSelectAllStudents = () => {
    const allAvailableIds = availableStudents.map((s) => s.id)
    setSelectedStudentIds((prev) => [...prev, ...allAvailableIds.filter((id) => !prev.includes(id))])
  }

  const toggleClassStudentsVisibility = (classId: string) => {
    setVisibleClassStudents((prev) => ({ ...prev, [classId]: !prev[classId] }))
  }

  const handleConfirmClass = async () => {
    if (!selectedCourseId) {
      alert("Selecione o curso da turma.")
      return
    }
    if (selectedStudentIds.length === 0) {
      alert("Selecione pelo menos um aluno.")
      return
    }
    setConfirmLoading(true)
    try {
      const newClass = await classService.addClass({
        name: turmaName,
        color: turmaColor,
        courseId: selectedCourseId,
      })
      if (!newClass) return

      await classService.addStudentsToClass(newClass.id, selectedStudentIds)

      const full = await getClassById(newClass.id)
      if (full) setConfirmedClasses((prev) => [...prev, full])

      setSelectedStudentIds([])
      setTurmaName(generateTurmaName())
      setTurmaColor(generateRandomColor())
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Adicionar Estudante</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddStudent} className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 w-full">
              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="studentUsername">Email</Label>
                <Input
                  id="studentUsername"
                  type="text"
                  placeholder="ex.: joao.silva"
                  value={studentUsername}
                  onChange={(e) => setStudentUsername(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="studentDomain">Domínio (se não inserir @, será usado este valor)</Label>
                <Input
                  id="studentDomain"
                  type="text"
                  placeholder="ex.: gmail.com"
                  value={studentDomain}
                  onChange={(e) => setStudentDomain(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={studentLoading}>
              {studentLoading ? "A adicionar..." : "Adicionar Estudante"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-row w-full gap-4 ">
        <Card className="mb-8 flex flex-col w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Configurar Turma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex-1">
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
              <div className="flex flex-row items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="turmaName">Nome da Turma</Label>
                  <Input id="turmaName" type="text" value={turmaName} onChange={(e) => setTurmaName(e.target.value)} />
                </div>
                <div className="w-32">
                  <Label htmlFor="turmaColor">Cor</Label>
                  <Input id="turmaColor" type="color" value={turmaColor} onChange={(e) => setTurmaColor(e.target.value)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="mb-8 flex flex-col w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Turmas Confirmadas</CardTitle>
          </CardHeader>
          <CardContent>
            {confirmedClasses.length === 0 ? (
              <p className="text-gray-500">Nenhuma turma confirmada.</p>
            ) : (
              <ul className="space-y-4">
                {confirmedClasses.map((cls) => (
                  <li key={cls.id} className="border p-4 rounded">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: cls.color ?? "#ccc" }} />
                        <span className="font-bold">{cls.name}</span>
                      </div>
                      <Button onClick={() => toggleClassStudentsVisibility(cls.id)} variant="outline">
                        {visibleClassStudents[cls.id] ? "Ocultar Alunos" : "Mostrar Alunos"}
                      </Button>
                    </div>
                    {visibleClassStudents[cls.id] && (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Alunos na Turma</h3>
                        {cls.students.length === 0 ? (
                          <p className="text-gray-500">Nenhum aluno atribuído.</p>
                        ) : (
                          <ul className="border p-2 rounded max-h-60 overflow-auto">
                            {cls.students.map((s) => (
                              <li key={s.id} className="p-2 border-b last:border-0">
                                {s.user.profile?.displayName?.trim() || s.user.email}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-row gap-4 w-full">
        <Card className="mb-8 flex flex-col w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Estudantes Disponíveis</CardTitle>
              <Button onClick={handleSelectAllStudents} variant="outline">
                Selecionar Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {availableStudents.length === 0 ? (
              <p className="text-gray-500">Nenhum estudante disponível.</p>
            ) : (
              <ul className="border p-2 rounded max-h-60 overflow-auto">
                {availableStudents.map((student) => (
                  <li
                    key={student.id}
                    className="p-2 cursor-pointer hover:bg-gray-100 border-b last:border-0"
                    onClick={() => handleSelectStudent(student.id)}
                  >
                    {studentLabel(student)}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="mb-8 flex flex-col w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Estudantes Selecionados</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedStudents.length === 0 ? (
              <p className="text-gray-500">Nenhum estudante selecionado.</p>
            ) : (
              <ul className="border p-2 rounded max-h-60 overflow-auto">
                {selectedStudents.map((student) => (
                  <li
                    key={student.id}
                    className="p-2 cursor-pointer hover:bg-gray-100 border-b last:border-0"
                    onClick={() => handleSelectStudent(student.id)}
                  >
                    {studentLabel(student)}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleConfirmClass} className="w-full" disabled={confirmLoading}>
        {confirmLoading ? "A confirmar..." : "Confirmar Turma"}
      </Button>
    </div>
  )
}

export default ManageStudentsAndClassesPage
