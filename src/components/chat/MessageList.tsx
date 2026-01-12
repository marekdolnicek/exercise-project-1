'use client'

import { useEffect, useRef } from 'react'
import { UIMessage } from '@ai-sdk/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { OptionChips } from './OptionChips'
import { Skeleton } from '@/components/ui/skeleton'

interface MessageListProps {
  messages: UIMessage[]
  isLoading: boolean
  addToolOutput: (params: {
    tool: string
    toolCallId: string
    output: unknown
  }) => void
}

export function MessageList({
  messages,
  isLoading,
  addToolOutput,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <ScrollArea className="h-full p-4" ref={scrollRef}>
      <div className="space-y-4 max-w-3xl mx-auto">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            {message.parts.map((part, idx) => {
              if (part.type === 'text' && part.text) {
                return (
                  <MessageBubble
                    key={idx}
                    role={message.role}
                    content={part.text}
                  />
                )
              }
              // Handle tool-presentOptions part type (AI SDK uses tool-<toolName> format)
              if (part.type === 'tool-presentOptions') {
                const toolPart = part as unknown as {
                  type: string
                  toolCallId: string
                  state: 'input-streaming' | 'input-available' | 'output-available'
                  input?: Record<string, unknown>
                }
                // Map SDK states to OptionChips states
                const chipState = toolPart.state === 'output-available' ? 'result' :
                                  toolPart.state === 'input-available' ? 'call' : 'partial-call'
                if (toolPart.input && Object.keys(toolPart.input).length > 0) {
                  return (
                    <OptionChips
                      key={idx}
                      toolCallId={toolPart.toolCallId}
                      args={toolPart.input as {
                        question: string
                        options: Array<{
                          id: string
                          label: string
                          description?: string
                        }>
                        allowMultiple?: boolean
                        allowOther?: boolean
                      }}
                      state={chipState}
                      onSubmit={(selection) => {
                        addToolOutput({
                          tool: 'presentOptions',
                          toolCallId: toolPart.toolCallId,
                          output: selection,
                        })
                      }}
                    />
                  )
                }
              }
              return null
            })}
          </div>
        ))}
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
