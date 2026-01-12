'use client'

import { useMonitoringStore } from '@/store/monitoring-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ScopeSection } from './ScopeSection'
import { SourcesSection } from './SourcesSection'
import { CreateButton } from './CreateButton'

export function PreviewPanel() {
  const { task, isComplete } = useMonitoringStore()
  const hasContent =
    task.scope.topic ||
    task.scope.keywords.length > 0 ||
    task.scope.entities.length > 0 ||
    task.sources.length > 0

  return (
    <div className="flex flex-col h-full bg-muted/30">
      <div className="border-b p-4">
        <h2 className="font-semibold">Task Preview</h2>
        <p className="text-xs text-muted-foreground">Real-time configuration view</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {hasContent ? (
          <div className="space-y-4">
            <ScopeSection scope={task.scope} />
            {task.sources.length > 0 && <SourcesSection sources={task.sources} />}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Start chatting to configure your monitoring task
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4">
        <CreateButton isComplete={isComplete} />
      </div>
    </div>
  )
}
