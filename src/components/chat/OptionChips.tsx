'use client'

import { useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'

interface OptionChipsProps {
  toolCallId: string
  args: {
    question: string
    options: Array<{ id: string; label: string; description?: string }>
    allowMultiple?: boolean
    allowOther?: boolean
  }
  state: 'partial-call' | 'call' | 'result'
  onSubmit?: (selection: { selectedIds: string[]; otherText?: string }) => void
}

export function OptionChips({
  toolCallId,
  args,
  state,
  onSubmit,
}: OptionChipsProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [showOther, setShowOther] = useState(false)
  const [otherValue, setOtherValue] = useState('')
  const [submitted, setSubmitted] = useState(state === 'result')

  if (state === 'partial-call') {
    return (
      <div className="space-y-2 p-3 border rounded-lg">
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    )
  }

  const handleSubmit = () => {
    setSubmitted(true)
    if (onSubmit) {
      onSubmit({
        selectedIds: selected,
        otherText: otherValue || undefined,
      })
    }
  }

  if (submitted) {
    return (
      <div className="p-3 border rounded-lg bg-muted/30">
        <p className="text-sm text-muted-foreground mb-2">{args.question}</p>
        <div className="flex flex-wrap gap-2">
          {selected.map((id) => {
            const opt = args.options.find((o) => o.id === id)
            return opt ? (
              <Badge key={id} variant="secondary">
                {opt.label}
              </Badge>
            ) : null
          })}
          {otherValue && <Badge variant="outline">{otherValue}</Badge>}
        </div>
      </div>
    )
  }

  const toggleGroupItems = args.options.map((opt) => (
    <ToggleGroupItem
      key={opt.id}
      value={opt.id}
      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      title={opt.description}
    >
      {opt.label}
    </ToggleGroupItem>
  ))

  return (
    <div className="p-3 border rounded-lg space-y-3">
      <p className="text-sm font-medium">{args.question}</p>
      {args.allowMultiple ? (
        <ToggleGroup
          type="multiple"
          value={selected}
          onValueChange={(val: string[]) => setSelected(val)}
          className="flex flex-wrap gap-2 justify-start"
        >
          {toggleGroupItems}
        </ToggleGroup>
      ) : (
        <ToggleGroup
          type="single"
          value={selected[0] ?? ''}
          onValueChange={(val: string) => setSelected(val ? [val] : [])}
          className="flex flex-wrap gap-2 justify-start"
        >
          {toggleGroupItems}
        </ToggleGroup>
      )}

      {args.allowOther && (
        <div className="flex gap-2">
          {showOther ? (
            <Input
              placeholder="Type custom option..."
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
              className="flex-1"
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOther(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Other
            </Button>
          )}
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={selected.length === 0 && !otherValue}
        className="w-full"
      >
        Confirm Selection {selected.length > 0 && `(${selected.length})`}
      </Button>
    </div>
  )
}
