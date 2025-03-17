"use client"

import { useState, useEffect } from "react"
import useZustandViewer from "@/lib/hooks/use-zustand-viewer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

// Lista de entidades (excluindo "all", "search" e "advanced" que são modos de pesquisa)
const entities = [
  "users",
  "notifications",
  "courses",
  "modules",
  "topics",
  "lessons",
  "courseModules",
  "moduleTopics",
  "moduleLessons",
  "classes",
  "teams",
  "moduleAssignments",
  "enrollments",
  "classStudents",
  "moduleTeams",
  "classScheduleLessons",
]

// Definimos a lista de tabs disponíveis
const tabs = ["all", ...entities, "search", "advanced"]

// Função para analisar o texto do input e gerar um objeto de filtros
function parseFilterInput(input: string) {
  const filterMap: Record<string, string[]> = {}
  const parts = input.split(",")
  parts.forEach((part) => {
    const [field, value] = part.split(":").map((s) => s.trim())
    if (field && value) {
      if (!filterMap[field]) {
        filterMap[field] = []
      }
      filterMap[field].push(value)
    }
  })
  return filterMap
}

const ZustandViewerPage = () => {
  // Estado para a tab ativa
  const [activeTab, setActiveTab] = useState("all")
  
  // Estados para a pesquisa padrão (quando a tab activa não for "search" nem "advanced")
  const [filterText, setFilterText] = useState("")
  const [selectedEntities, setSelectedEntities] = useState<string[]>(entities)

  // Estados para a pesquisa simples (tab "search")
  const [searchEntity, setSearchEntity] = useState("users")
  const [searchId, setSearchId] = useState("")

  // Estado para a pesquisa avançada (tab "advanced")
  const [advancedFilterText, setAdvancedFilterText] = useState("")

  // Estado dos filtros (usado na pesquisa padrão)
  const [filters, setFilters] = useState<Record<string, string[]>>({})

  // Atualiza os filtros com base no input da pesquisa padrão
  useEffect(() => {
    if (activeTab !== "advanced" && activeTab !== "search") {
      setFilters(parseFilterInput(filterText))
    }
  }, [filterText, activeTab])

  // Manipulação das tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "all") {
      setSelectedEntities(entities)
    } else if (entities.includes(value)) {
      // Selecciona apenas a entidade correspondente
      setSelectedEntities([value])
    } else if (value === "search") {
      // Inicializa estados para pesquisa simples
      setSearchEntity("users")
      setSearchId("")
    } else if (value === "advanced") {
      // Inicializa o estado para pesquisa avançada
      setAdvancedFilterText("")
    }
  }

  const handleReset = () => {
    setFilterText("")
    setAdvancedFilterText("")
    setSelectedEntities(entities)
    setSearchEntity("users")
    setSearchId("")
    setActiveTab("all")
  }

  // Se o clique for com o botão do meio, insere automaticamente o campo no input (apenas para a pesquisa padrão)
  const handleInsertField = (field: string) => {
    if (activeTab === "search" || activeTab === "advanced") return
    const prefix = filterText.trim() !== "" ? ", " : ""
    setFilterText(filterText + prefix + `${field}: `)
  }

  // Determinar os parâmetros efetivos para a pesquisa com base na tab activa
  let effectiveEntities: string[] = []
  let effectiveFilters: Record<string, string[]> = {}

  if (activeTab === "search") {
    effectiveEntities = [searchEntity]
    effectiveFilters = searchId.trim() !== "" ? { id: [searchId.trim()] } : {}
  } else if (activeTab === "advanced") {
    effectiveEntities = selectedEntities // Pode pesquisar em todas as entidades seleccionadas
    effectiveFilters = advancedFilterText.trim() !== "" ? parseFilterInput(advancedFilterText) : {}
  } else {
    effectiveEntities = selectedEntities
    effectiveFilters = filters
  }

  // Obter os dados filtrados através do hook personalizado
  const storeData = useZustandViewer(effectiveEntities, effectiveFilters)

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Zustand Store Viewer</CardTitle>
          <Button onClick={handleReset} variant="outline" size="sm">
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col gap-4 p-4">
        {/* Inputs específicos para cada modo de pesquisa */}
        {activeTab !== "search" && activeTab !== "advanced" && (
          <Input
            placeholder="Ex.: id: user-001, courseId: course-002"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full"
          />
        )}

        {activeTab === "advanced" && (
          <Input
            placeholder="Ex.: status: active, role: admin"
            value={advancedFilterText}
            onChange={(e) => setAdvancedFilterText(e.target.value)}
            className="w-full"
          />
        )}

        {activeTab === "search" && (
          <div className="flex gap-2">
            <select
              value={searchEntity}
              onChange={(e) => setSearchEntity(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {entities.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
            <Input
              placeholder="Introduza o ID para pesquisar"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {/* Tabs para seleccionar o modo de pesquisa */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <TabsList className="inline-flex w-max p-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="px-3 py-1.5"
                  onAuxClick={(e) => {
                    // Insere automaticamente o campo no input apenas na pesquisa padrão
                    if (tab !== "search" && tab !== "advanced") {
                      e.preventDefault()
                      handleInsertField(tab)
                    }
                  }}
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </Tabs>

        {/* Exibição dos resultados filtrados */}
        <Card className="flex-grow overflow-hidden">
          <CardContent className="p-0 h-full">
            <ScrollArea className="h-full max-h-[calc(100vh-280px)]">
              <pre className="text-sm text-gray-600 p-4">
                {storeData && Object.keys(storeData).length > 0
                  ? JSON.stringify(storeData, null, 2)
                  : "No data available"}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

export default ZustandViewerPage
