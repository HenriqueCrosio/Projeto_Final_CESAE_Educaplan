"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { courseService } from "@/services/data-services/course.service"
import { courseWrapperService } from "@/services/wrapper-services/course.wrapper-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function CreateCoursePage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [addNewCategory, setAddNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await courseService.getCategories()
      setCategories(cats)
    }
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const finalCategory = addNewCategory && newCategory.trim().length > 0 ? newCategory : category

    const courseData = {
      name,
      description,
      category: finalCategory,
    }

    const result = await courseWrapperService.createCourseWithModules(courseData)
    if (result.success) {
      setName("")
      setDescription("")
      setCategory("")
      setAddNewCategory(false)
      setNewCategory("")
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

        <p className="text-sm text-muted-foreground">
          Depois de criar o curso, adicione módulos a ele em <strong>Adicionar novo módulo</strong>.
        </p>

        <div className="flex w-full justify-center">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adicionar Curso..." : "Criar Curso"}
          </Button>
        </div>
      </form>
    </div>
  )
}
