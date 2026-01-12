'use client'

import { useState } from 'react'
import { Brain, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReasoningBlockProps {
  content: string
}

export function ReasoningBlock({ content }: ReasoningBlockProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border rounded-lg overflow-hidden bg-muted/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground',
          'hover:bg-muted/80 transition-colors'
        )}
      >
        <Brain className="h-4 w-4" />
        <span>Reasoning</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 ml-auto" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-auto" />
        )}
      </button>
      {isOpen && (
        <div className="px-3 py-2 text-xs text-muted-foreground border-t">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      )}
    </div>
  )
}
