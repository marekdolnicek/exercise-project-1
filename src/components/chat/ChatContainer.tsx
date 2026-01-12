'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { lastAssistantMessageIsCompleteWithToolCalls } from 'ai'
import { useMonitoringStore } from '@/store/monitoring-store'
import { getTemplateById } from '@/lib/source-templates'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'

export function ChatContainer() {
  const store = useMonitoringStore()
  const [input, setInput] = useState('')

  const { messages, sendMessage, status, addToolOutput } = useChat({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: ({ toolCall }) => {
      const input = (toolCall as { input?: unknown }).input
      if (toolCall.toolName === 'updateScope' && input) {
        const args = input as {
          topic?: string
          keywords?: string[]
          entities?: Array<{
            type: 'company' | 'person' | 'product' | 'topic'
            name: string
          }>
          intent?: string
        }
        if (args?.topic) store.setTopic(args.topic)
        if (args?.intent) store.setIntent(args.intent)
        if (args?.keywords) args.keywords.forEach((k) => store.addKeyword(k))
        if (args?.entities) args.entities.forEach((e) => store.addEntity(e))
      }
      if (toolCall.toolName === 'addSourceTemplate' && input) {
        const args = input as { templateId: string }
        const template = args ? getTemplateById(args.templateId) : null
        if (template) store.addSources(template.sources)
      }
      if (toolCall.toolName === 'confirmTask') {
        store.setComplete(true)
      }
    },
  })

  const isLoading = status === 'streaming' || status === 'submitted'
  const isFirstMessage = messages.length === 0

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input
    setInput('')
    await sendMessage({ text })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          addToolOutput={addToolOutput}
        />
      </div>
      <div className="border-t p-4">
        <MessageInput
          input={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          placeholder={isFirstMessage ? "I want to monitor " : "Type your message..."}
        />
      </div>
    </div>
  )
}
