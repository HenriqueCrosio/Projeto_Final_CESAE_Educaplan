"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { topicService } from "@/services/data-services/topic.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { TopicListItem } from "@/services/data-services/topic.service"

export default function TopicsPage() {
  const [topics, setTopics] = useState<TopicListItem[]>([])
  const [filteredTopics, setFilteredTopics] = useState<TopicListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("q") || ""

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const ownTopics = await topicService.getTopicsByTeacher()
        setTopics(ownTopics)
        setFilteredTopics(ownTopics)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopics()
  }, [])

  useEffect(() => {
    const filtered = topics.filter((topic) => topic.name.toLowerCase().includes(searchQuery.toLowerCase()))
    setFilteredTopics(filtered)
  }, [searchQuery, topics])

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Meus Tópicos Criados</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="h-[400px] flex flex-col">
              <CardHeader>
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <div className="p-6 mt-auto">
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      {filteredTopics.length === 0 ? (
        <p className="text-gray-600">
          {searchQuery ? "Nenhum tópico encontrado com esse nome." : "Você ainda não criou nenhum tópico."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic) => (
            <Link key={topic.id} href={`/dashboard/cursos/topicos/${topic.id}`} className="block h-full">
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{topic.name}</CardTitle>
                  <CardDescription className="line-clamp-1">
                    {topic.module?.name ?? "Sem módulo"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{topic.description}</p>
                    <h4 className="text-sm font-semibold mt-4 mb-1">Objetivos:</h4>
                    <ul className="text-xs text-gray-600 list-disc list-inside">
                      {topic.objectives.map((objective) => (
                        <li key={objective.id} className="ml-6 line-clamp-1">
                          {objective.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      <div className="h-10"></div>
    </div>
  )
}

