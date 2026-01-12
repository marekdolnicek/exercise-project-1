# AI Monitoring Task Creator - Compact Implementation Plan

**Stack:** Next.js 15 + TypeScript + Tailwind + shadcn/ui + Vercel AI SDK + Zustand

---

## Dependencies

```bash
# Core
pnpm add ai @ai-sdk/azure @ai-sdk/react zod zustand nanoid sonner lucide-react

# shadcn (auto-installs Radix)
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card badge input scroll-area toggle-group separator skeleton sonner
```

---

## Phase 1: Project Setup

### 1.1 Init Next.js

```bash
pnpm create next-app@latest temp-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --yes
mv temp-app/* temp-app/.* . 2>/dev/null; rmdir temp-app
```

### 1.2 Environment

`.env.local`:
```env
AZURE_OPENAI_API_KEY=9bd2d13588a14f4cae62325fc68d7d64
AZURE_OPENAI_RESOURCE_NAME=aim-australia-east
AZURE_OPENAI_MODEL=gpt-5-hiring
```

---

## Phase 2: Data Layer

### 2.1 Schema (`src/lib/schema.ts`)

```typescript
import { z } from 'zod'

export const EntitySchema = z.object({
  id: z.string(),
  type: z.enum(['company', 'person', 'product', 'topic']),
  name: z.string(),
  aliases: z.array(z.string()).optional(),
})

export const FilterSchema = z.object({
  id: z.string(),
  type: z.enum(['include', 'exclude']),
  pattern: z.string(),
  field: z.enum(['title', 'content', 'source', 'author']).optional(),
})

export const SourceSchema = z.object({
  id: z.string(),
  type: z.enum(['website', 'social', 'news', 'rss', 'api']),
  name: z.string(),
  url: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  frequency: z.enum(['realtime', 'hourly', 'daily']).default('daily'),
  enabled: z.boolean().default(true),
})

export const MonitoringScopeSchema = z.object({
  topic: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  entities: z.array(EntitySchema).default([]),
  filters: z.array(FilterSchema).default([]),
  intent: z.string().optional(),
})

export const MonitoringTaskSchema = z.object({
  id: z.string(),
  scope: MonitoringScopeSchema,
  sources: z.array(SourceSchema).default([]),
  status: z.enum(['draft', 'active', 'paused']).default('draft'),
})

export type Entity = z.infer<typeof EntitySchema>
export type Filter = z.infer<typeof FilterSchema>
export type Source = z.infer<typeof SourceSchema>
export type MonitoringScope = z.infer<typeof MonitoringScopeSchema>
export type MonitoringTask = z.infer<typeof MonitoringTaskSchema>
```

### 2.2 Source Templates (`src/lib/source-templates.ts`)

```typescript
import { Source } from './schema'

export interface SourceTemplate {
  id: string
  name: string
  description: string
  icon: string
  sources: Source[]
}

export const sourceTemplates: SourceTemplate[] = [
  {
    id: 'tech-news',
    name: 'Tech News Bundle',
    description: 'TechCrunch, The Verge, Ars Technica, Hacker News',
    icon: 'Newspaper',
    sources: [
      { id: 'tn-1', type: 'news', name: 'TechCrunch', url: 'https://techcrunch.com', priority: 'high', frequency: 'hourly', enabled: true },
      { id: 'tn-2', type: 'news', name: 'The Verge', url: 'https://theverge.com', priority: 'high', frequency: 'hourly', enabled: true },
      { id: 'tn-3', type: 'news', name: 'Ars Technica', priority: 'medium', frequency: 'daily', enabled: true },
      { id: 'tn-4', type: 'rss', name: 'Hacker News', url: 'https://news.ycombinator.com/rss', priority: 'medium', frequency: 'hourly', enabled: true },
    ],
  },
  {
    id: 'social-media',
    name: 'Social Media Bundle',
    description: 'Twitter/X, LinkedIn, Reddit',
    icon: 'Users',
    sources: [
      { id: 'sm-1', type: 'social', name: 'Twitter/X', priority: 'high', frequency: 'realtime', enabled: true },
      { id: 'sm-2', type: 'social', name: 'LinkedIn', priority: 'medium', frequency: 'hourly', enabled: true },
      { id: 'sm-3', type: 'social', name: 'Reddit', priority: 'medium', frequency: 'hourly', enabled: true },
    ],
  },
  {
    id: 'financial-news',
    name: 'Financial News Bundle',
    description: 'Bloomberg, Reuters, Financial Times',
    icon: 'TrendingUp',
    sources: [
      { id: 'fn-1', type: 'news', name: 'Bloomberg', priority: 'high', frequency: 'realtime', enabled: true },
      { id: 'fn-2', type: 'news', name: 'Reuters', priority: 'high', frequency: 'realtime', enabled: true },
      { id: 'fn-3', type: 'news', name: 'Financial Times', priority: 'high', frequency: 'hourly', enabled: true },
    ],
  },
  {
    id: 'regulatory',
    name: 'Regulatory & Filings',
    description: 'SEC EDGAR, Federal Register',
    icon: 'FileText',
    sources: [
      { id: 'rg-1', type: 'api', name: 'SEC EDGAR', priority: 'high', frequency: 'daily', enabled: true },
      { id: 'rg-2', type: 'website', name: 'Federal Register', priority: 'medium', frequency: 'daily', enabled: true },
    ],
  },
  {
    id: 'developer',
    name: 'Developer Sources',
    description: 'GitHub, Stack Overflow, Dev.to',
    icon: 'Code',
    sources: [
      { id: 'dv-1', type: 'api', name: 'GitHub', priority: 'high', frequency: 'hourly', enabled: true },
      { id: 'dv-2', type: 'website', name: 'Stack Overflow', priority: 'medium', frequency: 'daily', enabled: true },
      { id: 'dv-3', type: 'rss', name: 'Dev.to', priority: 'low', frequency: 'daily', enabled: true },
    ],
  },
]

export const getTemplateById = (id: string) => sourceTemplates.find(t => t.id === id)
```

### 2.3 Zustand Store (`src/store/monitoring-store.ts`)

```typescript
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
```

---

## Phase 3: AI Integration

### 3.1 Azure Client (`src/lib/azure.ts`)

```typescript
import { createAzure } from '@ai-sdk/azure'

export const azure = createAzure({
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME!,
})

export const modelId = process.env.AZURE_OPENAI_MODEL || 'gpt-5-hiring'
```

### 3.2 Tools (`src/lib/tools.ts`)

```typescript
import { tool } from 'ai'
import { z } from 'zod'

export const tools = {
  presentOptions: tool({
    description: 'Present clickable options to user. ALWAYS use this for choices.',
    inputSchema: z.object({
      question: z.string(),
      options: z.array(z.object({ id: z.string(), label: z.string(), description: z.string().optional() })).min(2).max(8),
      allowMultiple: z.boolean().default(true),
      allowOther: z.boolean().default(true),
    }),
  }),

  updateScope: tool({
    description: 'Update monitoring scope',
    inputSchema: z.object({
      topic: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      entities: z.array(z.object({ type: z.enum(['company', 'person', 'product', 'topic']), name: z.string() })).optional(),
      intent: z.string().optional(),
    }),
    execute: async (input) => ({ success: true, updates: input }),
  }),

  addSourceTemplate: tool({
    description: 'Add source template by ID',
    inputSchema: z.object({ templateId: z.string() }),
    execute: async ({ templateId }) => ({ success: true, templateId }),
  }),

  confirmTask: tool({
    description: 'Mark task complete',
    inputSchema: z.object({ summary: z.string() }),
    execute: async ({ summary }) => ({ success: true, summary, status: 'ready' }),
  }),
}
```

### 3.3 System Prompt (`src/lib/prompt.ts`)

```typescript
import { sourceTemplates } from './source-templates'

export function makeSystemPrompt(): string {
  const templates = sourceTemplates.map(t => `- ${t.id}: ${t.name}`).join('\n')

  return `You are Aim's monitoring assistant. Help users create monitoring tasks conversationally.

## Flow
1. Understand topic → 2. Identify entities → 3. Add keywords → 4. Select sources → 5. Confirm

## Rules
- ALWAYS use presentOptions for choices (never text-based A/B/C)
- Use updateScope after user selections
- Use addSourceTemplate for source bundles
- Use confirmTask when done

## Source Templates
${templates}

Keep responses brief. User sees live preview panel.`
}
```

### 3.4 API Route (`src/app/api/chat/route.ts`)

```typescript
import { convertToModelMessages, streamText, UIMessage, smoothStream } from 'ai'
import { azure, modelId } from '@/lib/azure'
import { tools } from '@/lib/tools'
import { makeSystemPrompt } from '@/lib/prompt'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = await streamText({
    model: azure.responses(modelId),
    messages: await convertToModelMessages(messages),
    system: makeSystemPrompt(),
    providerOptions: { azure: { reasoningEffort: 'low', reasoningSummary: 'detailed' } },
    tools,
    experimental_transform: smoothStream(),
  })

  return result.toUIMessageStreamResponse({
    headers: { 'Transfer-Encoding': 'chunked', Connection: 'keep-alive' },
    sendReasoning: true,
  })
}
```

---

## Phase 4: Chat Components

### 4.1 ChatContainer (`src/components/chat/ChatContainer.tsx`)

- `useChat` hook with `/api/chat`
- `onToolCall` syncs to Zustand store
- Passes handlers to MessageList, MessageInput

### 4.2 MessageList (`src/components/chat/MessageList.tsx`)

- Iterates `messages` and `message.parts`
- Renders: `text` → MessageBubble, `reasoning` → ReasoningBlock, `tool-presentOptions` → OptionChips
- Auto-scroll on new messages

### 4.3 MessageBubble (`src/components/chat/MessageBubble.tsx`)

- User: right-aligned, primary bg
- Assistant: left-aligned, muted bg

### 4.4 ReasoningBlock (`src/components/chat/ReasoningBlock.tsx`)

- Collapsible, starts collapsed
- Brain icon + chevron toggle

### 4.5 OptionChips (`src/components/chat/OptionChips.tsx`)

- Uses `ToggleGroup` (multi-select)
- States: `input-streaming` (skeleton), `input-available` (interactive), `output-available` (readonly)
- "Other" button expands to text input
- "Confirm Selection (N)" submits

### 4.6 MessageInput (`src/components/chat/MessageInput.tsx`)

- Input + Send button
- Enter to submit, disabled during streaming

---

## Phase 5: Preview Components

### 5.1 PreviewPanel (`src/components/preview/PreviewPanel.tsx`)

- Subscribes to `useMonitoringStore`
- Header + ScrollArea + Footer (CreateButton)
- Empty state when no content

### 5.2 ScopeSection (`src/components/preview/ScopeSection.tsx`)

- Card with: Topic, Keywords (badges), Entities (outline badges), Filters, Intent

### 5.3 SourcesSection (`src/components/preview/SourcesSection.tsx`)

- Card with source list
- Icons by type, priority badges (color-coded), frequency icons

### 5.4 CreateButton (`src/components/preview/CreateButton.tsx`)

- Disabled until `isComplete`
- Loading → Success → "Create Another"
- `toast.success()` on create

---

## Phase 6: Layout

### 6.1 Page (`src/app/page.tsx`)

```typescript
import { ChatContainer } from '@/components/chat/ChatContainer'
import { PreviewPanel } from '@/components/preview/PreviewPanel'

export default function Home() {
  return (
    <main className="h-screen flex flex-col lg:flex-row">
      <div className="flex-1 lg:w-[60%] lg:flex-none border-b lg:border-b-0 lg:border-r h-[60vh] lg:h-full">
        <ChatContainer />
      </div>
      <div className="lg:w-[40%] lg:flex-none h-[40vh] lg:h-full">
        <PreviewPanel />
      </div>
    </main>
  )
}
```

### 6.2 Layout (`src/app/layout.tsx`)

- `<html className="dark">`
- Inter font
- `<Toaster position="bottom-right" />`

---

## Phase 7: Verify & Deploy

```bash
pnpm lint
pnpm type-check  # add "type-check": "tsc --noEmit" to scripts
pnpm build
vercel --prod
```

Set env vars in Vercel: `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_RESOURCE_NAME`, `AZURE_OPENAI_MODEL`

---

## File Structure

```
src/
├── app/
│   ├── api/chat/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── chat/
│   │   ├── ChatContainer.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   ├── OptionChips.tsx
│   │   └── ReasoningBlock.tsx
│   ├── preview/
│   │   ├── PreviewPanel.tsx
│   │   ├── ScopeSection.tsx
│   │   ├── SourcesSection.tsx
│   │   └── CreateButton.tsx
│   └── ui/ (shadcn)
├── lib/
│   ├── azure.ts
│   ├── prompt.ts
│   ├── schema.ts
│   ├── source-templates.ts
│   ├── tools.ts
│   └── utils.ts
└── store/
    └── monitoring-store.ts
```

---

## Key Decisions

| Decision | Choice |
|----------|--------|
| Model | `gpt-5-hiring` |
| Options | Multi-select chips |
| Sources | Predefined templates |
| Task completion | Mock toast |
| Mobile | Stack vertically |
| Reasoning | Show (collapsible) |
| Custom input | "Other" button expands |
