"use client"

import { useState, type FormEvent } from "react"

import { userService } from "@/services/data-services/user.service"
import { classService } from "@/services/data-services/class.service"
import { classStudentService } from "@/services/data-services/class-student.service"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import type { User, Class, ClassStudent } from "@/types/interfaces"
import { generateRandomColor, validateEmail } from "@/lib/utils"

const ManageStudentsAndClassesPage = () => {
  const [studentUsername, setStudentUsername] = useState("")
  const [studentDomain, setStudentDomain] = useState("gmail.com")
  const [students, setStudents] = useState<User[]>(userService.getStudents())
  const [studentLoading, setStudentLoading] = useState(false)

  const handleAddStudent = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedUsername = studentUsername.trim().toLowerCase()
    const trimmedDomain = studentDomain.trim().toLowerCase()
    if (!trimmedUsername) return
    const fullEmail = trimmedUsername.includes("@") ? trimmedUsername : `${trimmedUsername}@${trimmedDomain}`
    if (!validateEmail(fullEmail)) {
      return
    }
    setStudentLoading(true)
    try {
      const result = await userService.addStudent(fullEmail)
      if (result.success && result.user) {
        setStudents((prev) => [...prev, result.user as User])
        setStudentUsername("")
      }
    } finally {
      setStudentLoading(false)
    }
  }

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const availableStudents = students.filter((student) => !selectedStudentIds.includes(student.id))
  const selectedStudents = students.filter((student) => selectedStudentIds.includes(student.id))

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  const handleSelectAllStudents = () => {
    const allAvailableIds = availableStudents.map((s) => s.id)
    setSelectedStudentIds((prev) => [...prev, ...allAvailableIds.filter((id) => !prev.includes(id))])
  }

  const generateTurmaName = () => `Turma ${Date.now()}`
  const [turmaName, setTurmaName] = useState(generateTurmaName())
  const [turmaColor, setTurmaColor] = useState(generateRandomColor())

  const [confirmedClasses, setConfirmedClasses] = useState<Class[]>([])
  const [visibleClassStudents, setVisibleClassStudents] = useState<{ [key: string]: boolean }>({})

  const toggleClassStudentsVisibility = (classId: string) => {
    setVisibleClassStudents((prev) => ({ ...prev, [classId]: !prev[classId] }))
  }

  const getClassStudents = (classId: string): ClassStudent[] => {
    return classStudentService.getClassStudentsByClass(classId)
  }

  const handleConfirmClass = () => {
    if (selectedStudentIds.length === 0) {
      return
    }
    if (confirmedClasses.some((cls) => cls.color === turmaColor)) {
      return
    }
    const newClass = classService.addClass({
      name: turmaName,
      color: turmaColor,
      courseId: "",
      teacherId: "cm6bntysq0005s911c7r7o87g",
      imageUrl: "",
    })
    if (!newClass) {
      return
    }
    selectedStudentIds.forEach((studentId) => {
      const result = classStudentService.addClassStudent({
        classId: newClass.id,
        studentId,
      })
      if (!result) {
        console.error(`Falha ao adicionar o aluno ${studentId} à turma ${newClass.id}`)
      }
    })
    setConfirmedClasses((prev) => [...prev, newClass])
    setStudents((prev) => prev.filter((student) => !selectedStudentIds.includes(student.id)))
    setSelectedStudentIds([])
    setTurmaName(generateTurmaName())
    setTurmaColor(generateRandomColor())
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
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="turmaName">Nome da Turma</Label>
                <Input id="turmaName" type="text" value={turmaName} onChange={(e) => setTurmaName(e.target.value)} />
              </div>
              <div className="w-32">
                <Label htmlFor="turmaColor">Cor</Label>
                <Input id="turmaColor" type="color" value={turmaColor} onChange={(e) => setTurmaColor(e.target.value)} />
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
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: cls.color }} />
                      <span className="font-bold">{cls.name}</span>
                    </div>
                    <Button onClick={() => toggleClassStudentsVisibility(cls.id)} variant="outline">
                      {visibleClassStudents[cls.id] ? "Ocultar Alunos" : "Mostrar Alunos"}
                    </Button>
                  </div>
                  {visibleClassStudents[cls.id] && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Alunos na Turma</h3>
                      {getClassStudents(cls.id).length === 0 ? (
                        <p className="text-gray-500">Nenhum aluno atribuído.</p>
                      ) : (
                        <ul className="border p-2 rounded max-h-60 overflow-auto">
                          {getClassStudents(cls.id).map((cs) => {
                            const student = userService.getUserById(cs.studentId)
                            return (
                              <li key={cs.id} className="p-2 border-b last:border-0">
                                {student?.email || cs.studentId}
                              </li>
                            )
                          })}
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
            <p className="text-gray-500">Todos os estudantes foram selecionados.</p>
          ) : (
            <ul className="border p-2 rounded max-h-60 overflow-auto">
              {availableStudents.map((student) => (
                <li
                  key={student.id}
                  className="p-2 cursor-pointer hover:bg-gray-100 border-b last:border-0"
                  onClick={() => handleSelectStudent(student.id)}
                >
                  {student.email}
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
                  {student.email}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>


      </div>


      <Button onClick={handleConfirmClass} className="w-full">
        Confirmar Turma
      </Button>
    </div>
  )
}

export default ManageStudentsAndClassesPage

