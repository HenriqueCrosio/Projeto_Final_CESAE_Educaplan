"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { topicService } from "@/services/data-services/topic.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Topic } from "@/types/interfaces"
import { normalize } from "@/lib/utils/validation.utils"
import { GoBackButton } from "@/components/buttons/go-back-button"

export default function TopicDetailPage() {
  const [topic, setTopic] = useState<Topic | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    const fetchTopic = async () => {
      setIsLoading(true)
      try {
        const fetchedTopic = await topicService.getTopicBySlug(slug)
        setTopic(fetchedTopic)
      } catch (error) {
        console.error("Failed to fetch topic:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopic()
  }, [slug])

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!topic) {
    return <div className="container mx-auto">Topic not found</div>
  }

  return (
    <div className="container mx-auto">
        <div className="mb-4">
            <GoBackButton />
        </div>
      <Card>
        <CardHeader>
        <CardTitle className="line-clamp-1">{topic.name}</CardTitle>
        <CardDescription className="line-clamp-1">{topic.category}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">{topic.description}</p>
          <h2 className="text-xl font-semibold mb-4">Objetivos</h2>
          <ul className="list-disc list-inside space-y-2">
            {topic.objectives.map((objective) => (
              <li key={objective.id} className="text-gray-600">
                {objective.description}
              </li>
            ))}
                  </ul>
        <div className="flex gap-2 mt-4">
                  <Badge variant={topic.publishStatus === "PUBLISHED_FOR_RENT" ? "default" : "outline"}>
              {normalize(topic.publishStatus)}
            </Badge>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}

