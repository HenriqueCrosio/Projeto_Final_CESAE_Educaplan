/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { courseService } from "@/services/data-services/course.service"
import { moduleService } from "@/services/data-services/module.service"
import { courseWrapperService } from "@/services/wrapper-services/course.wrapper-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { minutesToHours } from "@/lib/utils"

const formatDuration = (minutes: number): string => {
  const hours = minutesToHours(minutes)
  const hrs = Math.floor(hours)
  const mins = Math.round((hours - hrs) * 60)
  if (hrs > 0 && mins > 0) {
    return `${hrs} ${hrs === 1 ? "hora" : "horas"} e ${mins} ${mins === 1 ? "minuto" : "minutos"}`
  } else if (hrs > 0) {
    return `${hrs} ${hrs === 1 ? "hora" : "horas"}`
  } else {
    return `${mins} ${mins === 1 ? "minuto" : "minutos"}`
  }
}

export default function CreateCoursePage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [addNewCategory, setAddNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const availableModules = moduleService.useModules()
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const cats = courseService.getCategories()
    setCategories(cats)
  }, [])

  const computedTotalMinutes = availableModules
    .filter((mod: any) => selectedModuleIds.includes(mod.id))
    .reduce((acc: number, mod: any) => acc + mod.totalMinutes, 0)

  const toggleModule = (moduleId: string) => {
    setSelectedModuleIds((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const finalCategory = addNewCategory && newCategory.trim().length > 0 ? newCategory : category

    const teacherId = courseService.getTeacherId()

    const courseData = {
      name,
      description,
      category: finalCategory,
      totalMinutes: computedTotalMinutes > 0 ? computedTotalMinutes : undefined,
      ownedId: [teacherId],
      ownerId: [teacherId],
    }

    const result = await courseWrapperService.createCourseWithModules(courseData, selectedModuleIds)
    if (result.success) {
      setName("")
      setDescription("")
      setCategory("")
      setAddNewCategory(false)
      setNewCategory("")
      setSelectedModuleIds([])
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-xl font-bold mb-4">Configurar Curso</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="courseName" className="text-sm font-medium">
            Nome do Curso
          </label>
          <Input
            id="courseName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Introduza o nome do curso"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Descrição
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Introduza a descrição do curso"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Categoria
          </label>
          <Select
            value={addNewCategory ? "add-new" : category}
            onValueChange={(val) => {
              if (val === "add-new") {
                setAddNewCategory(true)
                setCategory("")
              } else {
                setAddNewCategory(false)
                setCategory(val)
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
              <SelectItem value="add-new">Adicionar nova categoria</SelectItem>
            </SelectContent>
          </Select>
          {addNewCategory && (
            <div className="mt-2">
              <Input
                placeholder="Introduza a nova categoria"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
          )}
        </div>

        {computedTotalMinutes > 0 && (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Duração total do curso:</strong> {formatDuration(computedTotalMinutes)}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Selecionar Módulos</label>
          {availableModules.length > 0 ? (
            <div className="flex flex-wrap gap-2 flex-grow grow-1 flex-1">
              {availableModules.map((mod: any) => (
                <Button
                  key={mod.id}
                  type="button"
                  variant={selectedModuleIds.includes(mod.id) ? "default" : "outline"}
                  onClick={() => toggleModule(mod.id)}
                >
                  {mod.name} ({formatDuration(mod.totalMinutes)})
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Não existem módulos disponíveis. Por favor, adicione módulos ao store central.
            </p>
          )}
        </div>
        <div className="flex w-full justify-center">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adicionar Curso..." : "Criar Curso"}
          </Button>
        </div>

      </form>
    </div>
  )
}

