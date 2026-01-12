import { convertToModelMessages, streamText, UIMessage } from 'ai'
import { azure, modelId } from '@/lib/azure'
import { tools } from '@/lib/tools'
import { makeSystemPrompt } from '@/lib/prompt'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const result = streamText({
      model: azure(modelId),
      system: makeSystemPrompt(),
      messages: await convertToModelMessages(messages),
      tools,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
