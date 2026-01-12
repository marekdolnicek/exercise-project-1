import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { MonitoringTask, Source, Entity, Filter, MonitoringScope } from '@/lib/schema'
import { nanoid } from 'nanoid'

interface MonitoringState {
  task: MonitoringTask
  isComplete: boolean
  setTopic: (topic: string) => void
  setIntent: (intent: string) => void
  addKeyword: (keyword: string) => void
  removeKeyword: (keyword: string) => void
  addEntity: (entity: Omit<Entity, 'id'>) => void
  removeEntity: (id: string) => void
  addFilter: (filter: Omit<Filter, 'id'>) => void
  removeFilter: (id: string) => void
  addSource: (source: Omit<Source, 'id'>) => void
  addSources: (sources: Source[]) => void
  removeSource: (id: string) => void
  updateScope: (scope: Partial<MonitoringScope>) => void
  setComplete: (complete: boolean) => void
  reset: () => void
}

const initialTask: MonitoringTask = {
  id: nanoid(),
  scope: { keywords: [], entities: [], filters: [] },
  sources: [],
  status: 'draft',
}

export const useMonitoringStore = create<MonitoringState>()(
  persist(
    (set) => ({
      task: initialTask,
      isComplete: false,
      setTopic: (topic) => set((s) => ({ task: { ...s.task, scope: { ...s.task.scope, topic } } })),
      setIntent: (intent) => set((s) => ({ task: { ...s.task, scope: { ...s.task.scope, intent } } })),
      addKeyword: (keyword) => set((s) => ({ task: { ...s.task, scope: { ...s.task.scope, keywords: [...s.task.scope.keywords, keyword] } } })),
      removeKeyword: (keyword) => set((s) => ({ task: { ...s.task, scope: { ...s.task.scope, keywords: s.task.scope.keywords.filter(k => k !== keyword) } } })),
      addEntity: (entity) => set((s) => ({ task: { ...s.task, scope: { ...s.task.scope, entities: [...s.task.scope.entities, { ...entity, id: nanoid() }] } } })),
      removeEntity: (id) => set((s) => ({ task: { ...s.task, scope: { ...s.task.scope, entities: s.task.scope.entities.filter(e => e.id !== id) } } })),
      addFilter: (filter) => set((s) => ({ task: { ...s.task, scope: { ...s.task.scope, filters: [...s.task.scope.filters, { ...filter, id: nanoid() }] } } })),
      removeFilter: (id) => set((s) => ({ task: { ...s.task, scope: { ...s.task.scope, filters: s.task.scope.filters.filter(f => f.id !== id) } } })),
      addSource: (source) => set((s) => ({ task: { ...s.task, sources: [...s.task.sources, { ...source, id: nanoid() }] } })),
      addSources: (sources) => set((s) => ({ task: { ...s.task, sources: [...s.task.sources, ...sources] } })),
      removeSource: (id) => set((s) => ({ task: { ...s.task, sources: s.task.sources.filter(src => src.id !== id) } })),
      updateScope: (scope) => set((s) => ({ task: { ...s.task, scope: { ...s.task.scope, ...scope } } })),
      setComplete: (complete) => set({ isComplete: complete }),
      reset: () => set({ task: { ...initialTask, id: nanoid() }, isComplete: false }),
    }),
    { name: 'monitoring-task-storage', storage: createJSONStorage(() => sessionStorage) }
  )
)
