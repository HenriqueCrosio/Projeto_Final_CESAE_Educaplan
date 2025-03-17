import { type CoreMessage, streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json()

  const result = streamText({
    model: openai("gpt-3.5-turbo-1106"),
    system: "You are a helpful assistant.",
    messages,
  })

  return result.toDataStreamResponse()
}

