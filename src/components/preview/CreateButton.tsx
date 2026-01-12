'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useMonitoringStore } from '@/store/monitoring-store'
import { toast } from 'sonner'
import { Loader2, Plus, Rocket } from 'lucide-react'

interface CreateButtonProps {
  isComplete: boolean
}

export function CreateButton({ isComplete }: CreateButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const reset = useMonitoringStore((s) => s.reset)

  const handleCreate = async () => {
    setStatus('loading')
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500))
    setStatus('success')
    toast.success('Monitoring task created successfully!')
  }

  const handleCreateAnother = () => {
    reset()
    setStatus('idle')
  }

  if (status === 'success') {
    return (
      <Button onClick={handleCreateAnother} className="w-full" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Create Another Task
      </Button>
    )
  }

  return (
    <Button
      onClick={handleCreate}
      disabled={!isComplete || status === 'loading'}
      className="w-full"
    >
      {status === 'loading' ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <Rocket className="h-4 w-4 mr-2" />
          Create Monitoring Task
        </>
      )}
    </Button>
  )
}
