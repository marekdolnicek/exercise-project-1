# AI Monitoring Task Creator - Implementation Plan

**Date:** 12/01/26
**Branch:** `feature/implementation-2`
**Stack:** Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui + Vercel AI SDK + Zustand

---

## Complete Dependencies (package.json)

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | `^15.x` | React framework with App Router, server components, API routes |
| `react` | `^19.x` | UI library (included with Next.js) |
| `react-dom` | `^19.x` | React DOM renderer (included with Next.js) |
| `ai` | `^4.x` | Vercel AI SDK core - streamText, tools, UIMessage types |
| `@ai-sdk/azure` | `^1.x` | Azure OpenAI provider for AI SDK |
| `@ai-sdk/react` | `^1.x` | React hooks (useChat, useCompletion) |
| `zod` | `^3.x` | Runtime schema validation, TypeScript type inference |
| `zustand` | `^5.x` | Lightweight state management with persist middleware |
| `nanoid` | `^5.x` | Unique ID generation for entities/sources |
| `sonner` | `^1.x` | Toast notifications (used by shadcn sonner) |
| `lucide-react` | `^0.400+` | Icon library (used by shadcn components) |
| `class-variance-authority` | `^0.7` | CSS class composition (shadcn dependency) |
| `clsx` | `^2.x` | Conditional className utility (shadcn dependency) |
| `tailwind-merge` | `^2.x` | Merge Tailwind classes (shadcn dependency) |
| `@radix-ui/react-toggle-group` | `^1.x` | Accessible toggle group primitive |
| `@radix-ui/react-scroll-area` | `^1.x` | Accessible scroll area primitive |
| `@radix-ui/react-separator` | `^1.x` | Accessible separator primitive |
| `@radix-ui/react-dialog` | `^1.x` | Accessible dialog primitive |
| `@radix-ui/react-slot` | `^1.x` | Slot primitive for component composition |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | `^5.x` | TypeScript compiler |
| `@types/node` | `^22.x` | Node.js type definitions |
| `@types/react` | `^19.x` | React type definitions |
| `@types/react-dom` | `^19.x` | React DOM type definitions |
| `eslint` | `^9.x` | JavaScript/TypeScript linter |
| `eslint-config-next` | `^15.x` | Next.js ESLint configuration |
| `tailwindcss` | `^3.x` | Utility-first CSS framework |
| `postcss` | `^8.x` | CSS processor (Tailwind dependency) |
| `autoprefixer` | `^10.x` | CSS vendor prefixer (Tailwind dependency) |

### shadcn/ui Components (copied to project)

| Component | Radix Primitive | Purpose |
|-----------|-----------------|---------|
| `button` | - | Primary action buttons |
| `card` | - | Preview sections, source cards |
| `badge` | - | Keywords, entity type labels |
| `input` | - | Message input, "Other" text field |
| `scroll-area` | `@radix-ui/react-scroll-area` | Chat message scrolling |
| `toggle-group` | `@radix-ui/react-toggle-group` | Multi-select option chips |
| `separator` | `@radix-ui/react-separator` | Visual section dividers |
| `skeleton` | - | Loading state placeholders |
| `dialog` | `@radix-ui/react-dialog` | Confirmations (optional) |
| `sonner` | - | Toast notification wrapper |

---

## User Decisions (Confirmed)

| Decision | Choice |
|----------|--------|
| Model | `gpt-5-hiring` (quality) |
| Options | Multi-select chips |
| Sources | Predefined templates (bundles) |
| Task completion | Mock success toast |
| Mobile layout | Stack vertically |
| Reasoning | Show in UI |
| Custom input | "Other" button expands to text field |

---

## Architecture Overview

```
Desktop (60/40 split):
┌────────────────────────────────┬──────────────────────────┐
│         Chat Panel (60%)       │   Preview Panel (40%)    │
│  ┌──────────────────────────┐  │  ┌────────────────────┐  │
│  │  AI Reasoning (collaps.) │  │  │  Monitoring Scope  │  │
│  │  Message List            │  │  │  - Topic           │  │
│  │  - User messages         │  │  │  - Keywords        │  │
│  │  - AI responses          │  │  │  - Entities        │  │
│  │  - Option chips (multi)  │  │  ├────────────────────┤  │
│  │  - "Other" expand input  │  │  │  Sources           │  │
│  └──────────────────────────┘  │  │  - Template cards  │  │
│  ┌──────────────────────────┐  │  ├────────────────────┤  │
│  │  Input + Send            │  │  │  [Create Task]     │  │
│  └──────────────────────────┘  │  └────────────────────┘  │
└────────────────────────────────┴──────────────────────────┘

Mobile (stacked):
┌──────────────────────────────────────┐
│            Chat Panel                │
│  Messages + Options + Input          │
├──────────────────────────────────────┤
│          Preview Panel               │
│  Scope + Sources + Create Button     │
└──────────────────────────────────────┘
```

---

## Implementation Steps

### Phase 1: Project Foundation

> **Goal:** Set up the development environment with Next.js, TypeScript, Tailwind CSS, and shadcn/ui. Configure environment variables for Azure OpenAI integration.

#### 1.1 Initialize Next.js Project

**What:** Bootstrap a new Next.js 15+ application using the App Router architecture with TypeScript for type safety, Tailwind CSS for styling, and ESLint for code quality.

**Why:** Next.js App Router provides server components for efficient rendering, built-in API routes for the chat endpoint, and excellent TypeScript support. The `--src-dir` flag organizes code cleanly.

**Expected outcome:** A working Next.js dev server at `localhost:3000` with default page.

- [ ] Create Next.js app with TypeScript, Tailwind, ESLint

```bash
cd /Users/dolnma/projects/Pohovor_aim
pnpm create next-app@latest temp-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --yes
mv temp-app/* temp-app/.* . 2>/dev/null; rmdir temp-app
```

**Expected `package.json`:**
```json
{
  "name": "aim-monitoring",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:ci": "next lint --max-warnings 0",
    "type-check": "tsc --noEmit"
  }
}
```

---

#### 1.2 Install Dependencies

**What:** Install the Vercel AI SDK ecosystem for LLM integration, Zustand for state management, and utility libraries for the UI.

**Why:**
- `ai` + `@ai-sdk/azure` + `@ai-sdk/react`: Provides streaming chat, tool calling, and React hooks optimized for AI applications
- `zustand`: Minimal boilerplate state management with built-in persistence middleware
- `zod`: Runtime validation that generates TypeScript types - single source of truth for schemas
- `sonner` + `lucide-react`: Modern toast notifications and consistent iconography

**Expected outcome:** All dependencies installed in `node_modules`, `pnpm-lock.yaml` updated.

- [ ] Add AI SDK, Zustand, and supporting packages

```bash
pnpm add ai @ai-sdk/azure @ai-sdk/react zod zustand sonner lucide-react
pnpm add -D @types/node
```

**Dependencies breakdown:**
- `ai` - Vercel AI SDK core
- `@ai-sdk/azure` - Azure OpenAI provider
- `@ai-sdk/react` - React hooks (useChat)
- `zod` - Schema validation
- `zustand` - State management
- `sonner` - Toast notifications
- `lucide-react` - Icons

---

#### 1.3 Initialize shadcn/ui

**What:** Initialize the shadcn/ui component system which provides a CLI to copy beautifully designed, accessible components into your project (not a traditional npm dependency).

**Why:** shadcn/ui gives us full control over component code (no black-box library), Radix UI primitives for accessibility (WCAG compliant), and seamless Tailwind integration. Components are copied to `src/components/ui/`.

**Expected outcome:** `components.json` config file created, `src/lib/utils.ts` with `cn()` helper, CSS variables in `globals.css`.

- [ ] Setup shadcn/ui with dark mode

```bash
pnpm dlx shadcn@latest init
```

**Select options:**
- Style: Default
- Base color: Zinc
- CSS variables: Yes

**Generated `components.json`:**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

#### 1.4 Install shadcn Components

**What:** Use the shadcn CLI to copy specific UI components into the project. Each component is a `.tsx` file in `src/components/ui/`.

**Why:** We only install what we need - keeping bundle size small. Each component can be customized. The CLI handles installing required Radix primitives automatically.

**Expected outcome:** 10 component files in `src/components/ui/`, Radix dependencies added to `package.json`.

- [ ] Add required UI components

```bash
pnpm dlx shadcn@latest add button card badge input scroll-area toggle-group separator skeleton dialog sonner
```

**Components:**
- `button` - Primary actions
- `card` - Preview sections, source cards
- `badge` - Keywords, entity types
- `input` - Message input, "Other" input
- `scroll-area` - Chat message scrolling
- `toggle-group` - Multi-select option chips
- `separator` - Visual dividers
- `skeleton` - Loading states
- `dialog` - Confirmations (optional)
- `sonner` - Toast notifications

---

#### 1.5 Environment Setup

**What:** Create environment variable files for Azure OpenAI credentials. `.env.local` contains actual secrets (gitignored), `.env.example` documents required variables.

**Why:** Secrets must never be committed to git. Next.js automatically loads `.env.local` in development. Vercel loads these from project settings in production.

**Expected outcome:** `.env.local` with credentials, `.env.example` for documentation, updated `.gitignore`.

- [ ] Create environment files

**`.env.local`:**
```env
AZURE_OPENAI_API_KEY=9bd2d13588a14f4cae62325fc68d7d64
AZURE_OPENAI_RESOURCE_NAME=aim-australia-east
AZURE_OPENAI_MODEL=gpt-5-hiring
```

**`.env.example`:**
```env
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_RESOURCE_NAME=your-resource-name
AZURE_OPENAI_MODEL=gpt-5-hiring
```

**Update `.gitignore`:**
```gitignore
# env
.env
.env.local
.env.*.local

# dependencies
node_modules
.pnpm-store

# next.js
.next
out

# misc
.DS_Store
*.pem
```

---

### Phase 2: Data Layer

> **Goal:** Define the data model for monitoring tasks using Zod schemas, create predefined source templates, and set up Zustand for state management with session persistence.

#### 2.1 Define Zod Schemas

**What:** Create Zod schemas that define the shape of all data structures: Entity, Filter, Source, MonitoringScope, and MonitoringTask. Use `z.infer<>` to generate TypeScript types.

**Why:** Zod provides:
- Runtime validation (catch bad data from AI tool calls)
- TypeScript types from same source (no type drift)
- Default values and optional fields
- Clear documentation of data contracts

**Expected outcome:** `src/lib/schema.ts` with all schemas and exported types.

- [ ] Create type-safe schemas

**`src/lib/schema.ts`:**
```typescript
import { z } from 'zod'

// Entity types
export const EntityTypeSchema = z.enum(['company', 'person', 'product', 'topic'])
export type EntityType = z.infer<typeof EntityTypeSchema>

export const EntitySchema = z.object({
  id: z.string(),
  type: EntityTypeSchema,
  name: z.string(),
  aliases: z.array(z.string()).optional(),
})
export type Entity = z.infer<typeof EntitySchema>

// Filter rules
export const FilterSchema = z.object({
  id: z.string(),
  type: z.enum(['include', 'exclude']),
  pattern: z.string(),
  field: z.enum(['title', 'content', 'source', 'author']).optional(),
})
export type Filter = z.infer<typeof FilterSchema>

// Source types
export const SourceTypeSchema = z.enum(['website', 'social', 'news', 'rss', 'api'])
export type SourceType = z.infer<typeof SourceTypeSchema>

export const PrioritySchema = z.enum(['high', 'medium', 'low'])
export type Priority = z.infer<typeof PrioritySchema>

export const FrequencySchema = z.enum(['realtime', 'hourly', 'daily'])
export type Frequency = z.infer<typeof FrequencySchema>

export const SourceSchema = z.object({
  id: z.string(),
  type: SourceTypeSchema,
  name: z.string(),
  url: z.string().optional(),
  priority: PrioritySchema.default('medium'),
  frequency: FrequencySchema.default('daily'),
  enabled: z.boolean().default(true),
})
export type Source = z.infer<typeof SourceSchema>

// Source templates (bundles)
export const SourceTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(), // Lucide icon name
  sources: z.array(SourceSchema),
})
export type SourceTemplate = z.infer<typeof SourceTemplateSchema>

// Monitoring scope
export const MonitoringScopeSchema = z.object({
  topic: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  entities: z.array(EntitySchema).default([]),
  filters: z.array(FilterSchema).default([]),
  intent: z.string().optional(),
})
export type MonitoringScope = z.infer<typeof MonitoringScopeSchema>

// Complete monitoring task
export const MonitoringTaskSchema = z.object({
  id: z.string(),
  scope: MonitoringScopeSchema,
  sources: z.array(SourceSchema).default([]),
  createdAt: z.date().optional(),
  status: z.enum(['draft', 'active', 'paused']).default('draft'),
})
export type MonitoringTask = z.infer<typeof MonitoringTaskSchema>
```

---

#### 2.2 Define Source Templates

**What:** Create predefined bundles of sources (e.g., "Tech News Bundle" with TechCrunch, The Verge, Hacker News) that users can add with one click instead of configuring individual sources.

**Why:** Reduces friction in the UX - users can quickly add relevant source groups. Templates include sensible defaults for priority/frequency. AI agent can recommend templates based on monitoring topic.

**Expected outcome:** `src/lib/source-templates.ts` with 5 template bundles and a lookup function.

- [ ] Create predefined source bundles

**`src/lib/source-templates.ts`:**
```typescript
import { SourceTemplate } from './schema'

export const sourceTemplates: SourceTemplate[] = [
  {
    id: 'tech-news',
    name: 'Tech News Bundle',
    description: 'Major technology news outlets',
    icon: 'Newspaper',
    sources: [
      { id: 'tn-1', type: 'news', name: 'TechCrunch', url: 'https://techcrunch.com', priority: 'high', frequency: 'hourly', enabled: true },
      { id: 'tn-2', type: 'news', name: 'The Verge', url: 'https://theverge.com', priority: 'high', frequency: 'hourly', enabled: true },
      { id: 'tn-3', type: 'news', name: 'Ars Technica', url: 'https://arstechnica.com', priority: 'medium', frequency: 'daily', enabled: true },
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
    description: 'Business and financial outlets',
    icon: 'TrendingUp',
    sources: [
      { id: 'fn-1', type: 'news', name: 'Bloomberg', url: 'https://bloomberg.com', priority: 'high', frequency: 'realtime', enabled: true },
      { id: 'fn-2', type: 'news', name: 'Reuters', url: 'https://reuters.com', priority: 'high', frequency: 'realtime', enabled: true },
      { id: 'fn-3', type: 'news', name: 'Financial Times', url: 'https://ft.com', priority: 'high', frequency: 'hourly', enabled: true },
    ],
  },
  {
    id: 'regulatory',
    name: 'Regulatory & Filings',
    description: 'SEC filings, government sources',
    icon: 'FileText',
    sources: [
      { id: 'rg-1', type: 'api', name: 'SEC EDGAR', url: 'https://sec.gov/edgar', priority: 'high', frequency: 'daily', enabled: true },
      { id: 'rg-2', type: 'website', name: 'Federal Register', url: 'https://federalregister.gov', priority: 'medium', frequency: 'daily', enabled: true },
    ],
  },
  {
    id: 'developer',
    name: 'Developer Sources',
    description: 'GitHub, Stack Overflow, Dev blogs',
    icon: 'Code',
    sources: [
      { id: 'dv-1', type: 'api', name: 'GitHub', url: 'https://github.com', priority: 'high', frequency: 'hourly', enabled: true },
      { id: 'dv-2', type: 'website', name: 'Stack Overflow', url: 'https://stackoverflow.com', priority: 'medium', frequency: 'daily', enabled: true },
      { id: 'dv-3', type: 'rss', name: 'Dev.to', url: 'https://dev.to/feed', priority: 'low', frequency: 'daily', enabled: true },
    ],
  },
]

export function getTemplateById(id: string): SourceTemplate | undefined {
  return sourceTemplates.find(t => t.id === id)
}
```

---

#### 2.3 Create Zustand Store

**What:** Create a Zustand store that holds the current MonitoringTask state and provides actions to update it. Use the `persist` middleware to save state to sessionStorage.

**Why:**
- Zustand is minimal (~1KB) with no boilerplate
- React components subscribe to specific state slices (efficient re-renders)
- `persist` middleware survives page refreshes during development
- Actions are co-located with state (easy to understand)

**Key actions:**
- `setTopic`, `addKeyword`, `addEntity` - granular scope updates
- `addSources` - bulk add from templates
- `setComplete` - mark task ready for creation
- `reset` - start fresh

**Expected outcome:** `src/store/monitoring-store.ts` with typed state, actions, and sessionStorage persistence.

- [ ] State management with persist

**`src/store/monitoring-store.ts`:**
```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { MonitoringTask, MonitoringScope, Source, Entity, Filter } from '@/lib/schema'
import { nanoid } from 'nanoid'

interface MonitoringState {
  task: MonitoringTask
  isComplete: boolean

  // Scope actions
  setTopic: (topic: string) => void
  setIntent: (intent: string) => void
  addKeyword: (keyword: string) => void
  removeKeyword: (keyword: string) => void
  addEntity: (entity: Omit<Entity, 'id'>) => void
  removeEntity: (id: string) => void
  addFilter: (filter: Omit<Filter, 'id'>) => void
  removeFilter: (id: string) => void

  // Source actions
  addSource: (source: Omit<Source, 'id'>) => void
  addSources: (sources: Source[]) => void
  removeSource: (id: string) => void
  toggleSource: (id: string) => void

  // Bulk actions
  updateScope: (scope: Partial<MonitoringScope>) => void
  setComplete: (complete: boolean) => void
  reset: () => void
}

const initialTask: MonitoringTask = {
  id: nanoid(),
  scope: {
    topic: undefined,
    keywords: [],
    entities: [],
    filters: [],
    intent: undefined,
  },
  sources: [],
  status: 'draft',
}

export const useMonitoringStore = create<MonitoringState>()(
  persist(
    (set, get) => ({
      task: initialTask,
      isComplete: false,

      // Scope actions
      setTopic: (topic) => set((state) => ({
        task: { ...state.task, scope: { ...state.task.scope, topic } }
      })),

      setIntent: (intent) => set((state) => ({
        task: { ...state.task, scope: { ...state.task.scope, intent } }
      })),

      addKeyword: (keyword) => set((state) => ({
        task: {
          ...state.task,
          scope: {
            ...state.task.scope,
            keywords: [...state.task.scope.keywords, keyword]
          }
        }
      })),

      removeKeyword: (keyword) => set((state) => ({
        task: {
          ...state.task,
          scope: {
            ...state.task.scope,
            keywords: state.task.scope.keywords.filter(k => k !== keyword)
          }
        }
      })),

      addEntity: (entity) => set((state) => ({
        task: {
          ...state.task,
          scope: {
            ...state.task.scope,
            entities: [...state.task.scope.entities, { ...entity, id: nanoid() }]
          }
        }
      })),

      removeEntity: (id) => set((state) => ({
        task: {
          ...state.task,
          scope: {
            ...state.task.scope,
            entities: state.task.scope.entities.filter(e => e.id !== id)
          }
        }
      })),

      addFilter: (filter) => set((state) => ({
        task: {
          ...state.task,
          scope: {
            ...state.task.scope,
            filters: [...state.task.scope.filters, { ...filter, id: nanoid() }]
          }
        }
      })),

      removeFilter: (id) => set((state) => ({
        task: {
          ...state.task,
          scope: {
            ...state.task.scope,
            filters: state.task.scope.filters.filter(f => f.id !== id)
          }
        }
      })),

      // Source actions
      addSource: (source) => set((state) => ({
        task: {
          ...state.task,
          sources: [...state.task.sources, { ...source, id: nanoid() }]
        }
      })),

      addSources: (sources) => set((state) => ({
        task: {
          ...state.task,
          sources: [...state.task.sources, ...sources]
        }
      })),

      removeSource: (id) => set((state) => ({
        task: {
          ...state.task,
          sources: state.task.sources.filter(s => s.id !== id)
        }
      })),

      toggleSource: (id) => set((state) => ({
        task: {
          ...state.task,
          sources: state.task.sources.map(s =>
            s.id === id ? { ...s, enabled: !s.enabled } : s
          )
        }
      })),

      // Bulk actions
      updateScope: (scope) => set((state) => ({
        task: {
          ...state.task,
          scope: { ...state.task.scope, ...scope }
        }
      })),

      setComplete: (complete) => set({ isComplete: complete }),

      reset: () => set({
        task: { ...initialTask, id: nanoid() },
        isComplete: false,
      }),
    }),
    {
      name: 'monitoring-task-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
```

---

### Phase 3: AI Integration

> **Goal:** Set up the AI backbone - Azure OpenAI client, tool definitions for the agent, system prompt that guides conversation flow, and the streaming API route.

#### 3.1 Azure OpenAI Client

**What:** Create a configured Azure OpenAI client using the `@ai-sdk/azure` provider. Export the client and model ID for use in the API route.

**Why:** Centralizes Azure configuration in one file. Environment variables keep credentials secure. The `createAzure()` function handles authentication and endpoint formatting.

**Expected outcome:** `src/lib/azure.ts` exporting `azure` client and `modelId`.

- [ ] Configure Azure provider

**`src/lib/azure.ts`:**
```typescript
import { createAzure } from '@ai-sdk/azure'

export const azure = createAzure({
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME!,
})

export const modelId = process.env.AZURE_OPENAI_MODEL || 'gpt-5-hiring'
```

---

#### 3.2 Define Agent Tools

**What:** Define tools that the AI agent can call during conversation. Each tool has a description (for the AI), input schema (Zod), and optional execute function (server-side).

**Tools:**
1. `presentOptions` - Client-side tool that renders clickable chips. No execute function - handled by React.
2. `updateScope` - Server-side tool to update topic/keywords/entities. Has execute function.
3. `addSourceTemplate` - Server-side tool to add a source bundle by ID.
4. `addCustomSource` - Server-side tool to add individual sources.
5. `confirmTask` - Server-side tool to mark task complete.

**Why:** Tool-calling gives the AI structured ways to interact with the UI. Zod schemas provide type safety and validation. Client-side tools (no execute) are rendered directly by React.

**Expected outcome:** `src/lib/tools.ts` with 5 tool definitions.

- [ ] Create tool definitions with Zod schemas

**`src/lib/tools.ts`:**
```typescript
import { tool } from 'ai'
import { z } from 'zod'

export const tools = {
  // Present clickable options to user (client-side tool)
  presentOptions: tool({
    description: 'Present multiple choice options to the user as clickable chips. User can select multiple options. Always include relevant options based on context.',
    inputSchema: z.object({
      question: z.string().describe('The question to ask'),
      options: z.array(z.object({
        id: z.string(),
        label: z.string(),
        description: z.string().optional(),
      })).min(2).max(8).describe('Options to present (2-8)'),
      allowMultiple: z.boolean().default(true).describe('Allow selecting multiple options'),
      allowOther: z.boolean().default(true).describe('Show "Other" button for custom input'),
    }),
  }),

  // Update monitoring scope (server-side tool)
  updateScope: tool({
    description: 'Update the monitoring task scope with topic, keywords, entities, or intent',
    inputSchema: z.object({
      topic: z.string().optional().describe('Main monitoring topic'),
      keywords: z.array(z.string()).optional().describe('Keywords to add'),
      entities: z.array(z.object({
        type: z.enum(['company', 'person', 'product', 'topic']),
        name: z.string(),
        aliases: z.array(z.string()).optional(),
      })).optional().describe('Entities to track'),
      intent: z.string().optional().describe('Why the user wants to monitor this'),
    }),
    execute: async (input) => {
      // Server-side execution - returns data for client to process
      return { success: true, updates: input }
    },
  }),

  // Add source template (server-side tool)
  addSourceTemplate: tool({
    description: 'Add a predefined source template/bundle to the monitoring task',
    inputSchema: z.object({
      templateId: z.string().describe('ID of the source template to add'),
    }),
    execute: async ({ templateId }) => {
      return { success: true, templateId }
    },
  }),

  // Add custom source (server-side tool)
  addCustomSource: tool({
    description: 'Add a custom source to the monitoring task',
    inputSchema: z.object({
      type: z.enum(['website', 'social', 'news', 'rss', 'api']),
      name: z.string(),
      url: z.string().optional(),
      priority: z.enum(['high', 'medium', 'low']).default('medium'),
      frequency: z.enum(['realtime', 'hourly', 'daily']).default('daily'),
    }),
    execute: async (source) => {
      return { success: true, source }
    },
  }),

  // Confirm and finalize task (server-side tool)
  confirmTask: tool({
    description: 'Mark the monitoring task as complete and ready for creation',
    inputSchema: z.object({
      summary: z.string().describe('Brief summary of the monitoring task'),
    }),
    execute: async ({ summary }) => {
      return { success: true, summary, status: 'ready' }
    },
  }),
}

export type Tools = typeof tools
```

---

#### 3.3 System Prompt

**What:** Create the system prompt that defines the AI agent's personality, conversation flow, and critical rules for tool usage.

**Key elements:**
- **Personality:** Friendly but efficient assistant
- **Flow:** Topic → Entities → Keywords → Sources → Confirm
- **Critical rule:** ALWAYS use `presentOptions` for choices - never text-based A/B/C
- **Context:** List of available source templates for recommendations

**Why:** The system prompt is the "programming" of the agent. Clear rules ensure consistent behavior. Including template IDs in prompt helps AI make relevant recommendations.

**Expected outcome:** `src/lib/prompt.ts` with `makeSystemPrompt()` function.

- [ ] Define agent behavior and conversation flow

**`src/lib/prompt.ts`:**
```typescript
import { sourceTemplates } from './source-templates'

export function makeSystemPrompt(): string {
  const templateList = sourceTemplates
    .map(t => `- ${t.id}: ${t.name} - ${t.description}`)
    .join('\n')

  return `You are a helpful monitoring assistant for Aim. Your job is to help users create monitoring tasks through natural conversation.

## Your Personality
- Friendly but efficient
- Ask clarifying questions when needed
- Guide users through the process step by step
- Celebrate progress and acknowledge their choices

## Conversation Flow
1. **Understand the topic**: What does the user want to monitor?
2. **Identify entities**: Companies, people, products, or topics to track
3. **Suggest keywords**: Help refine search terms
4. **Select sources**: Recommend relevant source bundles
5. **Confirm and create**: Summarize and finalize

## CRITICAL RULES
1. **ALWAYS use presentOptions tool** for any choice or question. NEVER ask users to type A/B/C or respond with text choices.
2. Make options contextually relevant to what the user is monitoring
3. Include 3-6 options typically, with an "Other" option for custom input
4. After user selects options, use updateScope or addSourceTemplate tools to update the task
5. Show your reasoning briefly before presenting options

## Available Source Templates
${templateList}

## Tool Usage Examples

When asking about topic:
- Use presentOptions with relevant topic categories

When asking about sources:
- Use presentOptions with relevant template IDs as option IDs
- After selection, use addSourceTemplate for each selected template

When confirming:
- Summarize what was configured
- Use confirmTask to finalize

## Response Format
1. Brief acknowledgment or reasoning (1-2 sentences)
2. Tool call (presentOptions, updateScope, addSourceTemplate, or confirmTask)
3. Never end with a text-based question - always use presentOptions

Remember: The user sees a preview panel updating in real-time. Keep the conversation focused and efficient.`
}
```

---

#### 3.4 Chat API Route

**What:** Create a Next.js API route at `/api/chat` that handles POST requests with chat messages, streams responses from Azure OpenAI, and returns properly formatted streaming responses.

**Key features:**
- `streamText()` - Enables token-by-token streaming for responsive UX
- `smoothStream()` - Transform that buffers tokens for smoother display
- `sendReasoning: true` - Includes AI reasoning in response (shown in UI)
- Custom headers for chunked transfer (fixes some streaming issues)

**Why:** Streaming provides instant feedback as the AI generates responses. The `toUIMessageStreamResponse()` method formats the stream for the `useChat` hook on the client.

**Expected outcome:** `src/app/api/chat/route.ts` with POST handler.

- [ ] Create streaming endpoint

**`src/app/api/chat/route.ts`:**
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
    providerOptions: {
      azure: {
        reasoningEffort: 'low',
        reasoningSummary: 'detailed',
      },
    },
    tools,
    experimental_transform: smoothStream(),
  })

  return result.toUIMessageStreamResponse({
    headers: {
      'Transfer-Encoding': 'chunked',
      Connection: 'keep-alive',
    },
    sendReasoning: true,
  })
}
```

---

### Phase 4: Chat UI Components

> **Goal:** Build the chat interface with message rendering, clickable option chips, reasoning display, and input area. Handle tool call responses and sync state to Zustand store.

#### 4.1 Chat Container

**What:** The root chat component that initializes the `useChat` hook, handles tool call responses, and syncs AI updates to the Zustand store.

**Key responsibilities:**
- Initialize `useChat` with API endpoint and transport
- `onToolCall` callback processes tool results and updates store
- Pass message handlers to child components
- Control input disabled state during streaming

**Why:** Centralizes chat state management. The `useChat` hook handles message history, streaming, and tool calling automatically. We only need to sync tool results to our store.

**Expected outcome:** `src/components/chat/ChatContainer.tsx` - orchestrates the chat experience.

- [ ] Main chat wrapper with useChat hook

**`src/components/chat/ChatContainer.tsx`:**
```typescript
'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useEffect, useCallback } from 'react'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { useMonitoringStore } from '@/store/monitoring-store'
import { getTemplateById } from '@/lib/source-templates'

export function ChatContainer() {
  const {
    setTopic,
    addKeyword,
    addEntity,
    addSources,
    setIntent,
    setComplete
  } = useMonitoringStore()

  const { messages, sendMessage, addToolOutput, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),

    // Handle tool results and sync to store
    onToolCall: async ({ toolCall }) => {
      // Handle server-side tool results
      if (toolCall.toolName === 'updateScope' && 'output' in toolCall) {
        const result = toolCall.output as { updates: Record<string, unknown> }
        if (result.updates.topic) setTopic(result.updates.topic as string)
        if (result.updates.intent) setIntent(result.updates.intent as string)
        if (result.updates.keywords) {
          (result.updates.keywords as string[]).forEach(k => addKeyword(k))
        }
        if (result.updates.entities) {
          (result.updates.entities as Array<{ type: string; name: string }>)
            .forEach(e => addEntity(e as { type: 'company' | 'person' | 'product' | 'topic'; name: string }))
        }
      }

      if (toolCall.toolName === 'addSourceTemplate' && 'output' in toolCall) {
        const result = toolCall.output as { templateId: string }
        const template = getTemplateById(result.templateId)
        if (template) {
          addSources(template.sources)
        }
      }

      if (toolCall.toolName === 'confirmTask' && 'output' in toolCall) {
        setComplete(true)
      }
    },
  })

  const handleSendMessage = useCallback((content: string) => {
    sendMessage({ role: 'user', content })
  }, [sendMessage])

  const handleOptionSelect = useCallback((toolCallId: string, selectedOptions: string[]) => {
    addToolOutput({
      toolCallId,
      output: JSON.stringify({ selectedOptions }),
    })
  }, [addToolOutput])

  const handleOtherInput = useCallback((toolCallId: string, customInput: string) => {
    addToolOutput({
      toolCallId,
      output: JSON.stringify({ customInput }),
    })
  }, [addToolOutput])

  return (
    <div className="flex flex-col h-full">
      <MessageList
        messages={messages}
        onOptionSelect={handleOptionSelect}
        onOtherInput={handleOtherInput}
      />
      <MessageInput
        onSend={handleSendMessage}
        disabled={status === 'streaming'}
      />
    </div>
  )
}
```

---

#### 4.2 Message List

**What:** Component that renders all messages in a scrollable area. Each message may contain multiple "parts" (text, reasoning, tool calls) that are rendered differently.

**Key features:**
- Iterates `message.parts` array (AI SDK 4.2+ format)
- Switch statement renders appropriate component for each part type
- Auto-scrolls to bottom when new messages arrive
- Shows welcome message when empty

**Why:** The AI SDK represents messages as parts to support multi-modal responses. A single AI message might include text + reasoning + tool call all at once.

**Expected outcome:** `src/components/chat/MessageList.tsx` with parts-aware rendering.

- [ ] Render messages with parts handling

**`src/components/chat/MessageList.tsx`:**
```typescript
'use client'

import { UIMessage } from 'ai'
import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { OptionChips } from './OptionChips'
import { ReasoningBlock } from './ReasoningBlock'

interface MessageListProps {
  messages: UIMessage[]
  onOptionSelect: (toolCallId: string, options: string[]) => void
  onOtherInput: (toolCallId: string, input: string) => void
}

export function MessageList({ messages, onOptionSelect, onOtherInput }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-4 max-w-3xl mx-auto">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-lg font-medium">Welcome to Aim Monitoring</p>
            <p className="text-sm mt-2">Tell me what you&apos;d like to monitor</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            {message.parts.map((part, index) => {
              switch (part.type) {
                case 'text':
                  return (
                    <MessageBubble
                      key={index}
                      role={message.role}
                      content={part.text}
                    />
                  )

                case 'reasoning':
                  return (
                    <ReasoningBlock
                      key={index}
                      content={part.reasoning}
                    />
                  )

                case 'tool-presentOptions':
                  return (
                    <OptionChips
                      key={part.toolCallId}
                      toolCallId={part.toolCallId}
                      state={part.state}
                      input={part.state !== 'input-streaming' ? part.input : undefined}
                      output={part.state === 'output-available' ? part.output : undefined}
                      onSelect={onOptionSelect}
                      onOtherInput={onOtherInput}
                    />
                  )

                default:
                  return null
              }
            })}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
```

---

#### 4.3 Message Bubble

**What:** Simple presentational component for rendering a single text message with role-based styling (user vs assistant).

**Styling:**
- User messages: Right-aligned, primary color background
- Assistant messages: Left-aligned, muted background
- Max width 80% to prevent full-width blocks
- Rounded corners for modern chat appearance

**Why:** Clean visual separation between user and AI messages. The component is intentionally simple - just text display.

**Expected outcome:** `src/components/chat/MessageBubble.tsx` with role-based styling.

- [ ] Styled message component

**`src/components/chat/MessageBubble.tsx`:**
```typescript
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={cn(
      'flex',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-2',
        isUser
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted'
      )}>
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}
```

---

#### 4.4 Reasoning Block

**What:** Collapsible component that shows the AI's reasoning/thinking process. Starts collapsed by default to reduce visual noise.

**Features:**
- Click to expand/collapse
- Brain icon + "AI Reasoning" label
- Chevron indicates state
- Smooth height transition animation
- Muted styling to not compete with main content

**Why:** Per user decision, reasoning should be visible but not intrusive. Collapsible design lets curious users explore AI thinking without cluttering the chat for others.

**Expected outcome:** `src/components/chat/ReasoningBlock.tsx` with expand/collapse state.

- [ ] Collapsible AI reasoning display

**`src/components/chat/ReasoningBlock.tsx`:**
```typescript
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReasoningBlockProps {
  content: string
}

export function ReasoningBlock({ content }: ReasoningBlockProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-muted/50 rounded-lg border border-border/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Brain className="h-3 w-3" />
        <span>AI Reasoning</span>
        {expanded ? (
          <ChevronUp className="h-3 w-3 ml-auto" />
        ) : (
          <ChevronDown className="h-3 w-3 ml-auto" />
        )}
      </button>

      <div className={cn(
        'overflow-hidden transition-all duration-200',
        expanded ? 'max-h-96' : 'max-h-0'
      )}>
        <div className="px-3 pb-3 text-xs text-muted-foreground whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  )
}
```

---

#### 4.5 Option Chips

**What:** The core interactive component that renders clickable options from the `presentOptions` tool call. Supports multi-select and "Other" custom input.

**States:**
- `input-streaming`: Show skeleton loading
- `input-available`: Show selectable chips + "Other" button
- `output-available`: Show confirmed selections with checkmarks

**Features:**
- Uses `ToggleGroup` from shadcn for multi/single select
- "Other" button expands to text input (per user decision)
- "Confirm Selection (N)" button submits choices
- Answered state shows read-only selected values

**Why:** This is the key UX differentiator - clickable chips instead of text-based choices. Multi-select reduces back-and-forth. "Other" provides escape hatch for edge cases.

**Expected outcome:** `src/components/chat/OptionChips.tsx` with state machine for tool call lifecycle.

- [ ] Multi-select chips with "Other" button

**`src/components/chat/OptionChips.tsx`:**
```typescript
'use client'

import { useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Option {
  id: string
  label: string
  description?: string
}

interface OptionChipsProps {
  toolCallId: string
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error'
  input?: {
    question: string
    options: Option[]
    allowMultiple?: boolean
    allowOther?: boolean
  }
  output?: { selectedOptions?: string[]; customInput?: string }
  onSelect: (toolCallId: string, options: string[]) => void
  onOtherInput: (toolCallId: string, input: string) => void
}

export function OptionChips({
  toolCallId,
  state,
  input,
  output,
  onSelect,
  onOtherInput,
}: OptionChipsProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [otherValue, setOtherValue] = useState('')

  const isAnswered = state === 'output-available'
  const isLoading = state === 'input-streaming'

  if (isLoading || !input) {
    return (
      <div className="flex gap-2 flex-wrap animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-9 w-24 bg-muted rounded-full" />
        ))}
      </div>
    )
  }

  const handleConfirm = () => {
    if (selected.length > 0) {
      onSelect(toolCallId, selected)
    }
  }

  const handleOtherSubmit = () => {
    if (otherValue.trim()) {
      onOtherInput(toolCallId, otherValue.trim())
    }
  }

  if (isAnswered && output) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{input.question}</p>
        <div className="flex gap-2 flex-wrap">
          {output.selectedOptions?.map(optId => {
            const opt = input.options.find(o => o.id === optId)
            return (
              <div
                key={optId}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
              >
                <Check className="h-3 w-3" />
                {opt?.label || optId}
              </div>
            )
          })}
          {output.customInput && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
              <Check className="h-3 w-3" />
              {output.customInput}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{input.question}</p>

      <ToggleGroup
        type={input.allowMultiple ? 'multiple' : 'single'}
        value={input.allowMultiple ? selected : selected[0]}
        onValueChange={(value) => {
          if (input.allowMultiple) {
            setSelected(value as string[])
          } else {
            setSelected(value ? [value as string] : [])
          }
        }}
        className="flex flex-wrap gap-2 justify-start"
      >
        {input.options.map((option) => (
          <ToggleGroupItem
            key={option.id}
            value={option.id}
            className={cn(
              'px-4 py-2 rounded-full border text-sm transition-all',
              'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
              'hover:bg-muted'
            )}
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {input.allowOther !== false && (
        <div className="flex gap-2">
          {!showOtherInput ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOtherInput(true)}
              className="rounded-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              Other
            </Button>
          ) : (
            <div className="flex gap-2 flex-1">
              <Input
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
                placeholder="Type your answer..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleOtherSubmit()}
              />
              <Button size="sm" onClick={handleOtherSubmit} disabled={!otherValue.trim()}>
                Submit
              </Button>
            </div>
          )}
        </div>
      )}

      {selected.length > 0 && !showOtherInput && (
        <Button onClick={handleConfirm} size="sm">
          Confirm Selection ({selected.length})
        </Button>
      )}
    </div>
  )
}
```

---

#### 4.6 Message Input

**What:** Fixed input area at the bottom of the chat panel with text input and send button.

**Features:**
- Text input with placeholder
- Send button with icon
- Enter key submits (Shift+Enter for newline later if needed)
- Disabled state during streaming to prevent double-sends
- Clears input after sending

**Why:** Standard chat input pattern. Disabled during streaming prevents race conditions and UI confusion.

**Expected outcome:** `src/components/chat/MessageInput.tsx` with controlled input.

- [ ] Input area with send button

**`src/components/chat/MessageInput.tsx`:**
```typescript
'use client'

import { useState, KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

interface MessageInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState('')

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value.trim())
      setValue('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t p-4">
      <div className="flex gap-2 max-w-3xl mx-auto">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
```

---

### Phase 5: Preview Panel

> **Goal:** Build the right-side preview panel that displays the monitoring task being built in real-time. Subscribe to Zustand store for automatic updates.

#### 5.1 Preview Container

**What:** The root preview component that subscribes to the Zustand store and renders child sections for scope, sources, and the create button.

**Features:**
- Subscribes to `useMonitoringStore` for real-time updates
- Header with title and description
- Scrollable content area
- Fixed footer with Create button
- Empty state when no content yet

**Why:** Separating the preview from chat provides clear visual feedback. Users see their task building in real-time, which builds confidence and reduces errors.

**Expected outcome:** `src/components/preview/PreviewPanel.tsx` with Zustand subscription.

- [ ] Main preview wrapper

**`src/components/preview/PreviewPanel.tsx`:**
```typescript
'use client'

import { useMonitoringStore } from '@/store/monitoring-store'
import { ScopeSection } from './ScopeSection'
import { SourcesSection } from './SourcesSection'
import { CreateButton } from './CreateButton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export function PreviewPanel() {
  const { task, isComplete } = useMonitoringStore()

  const hasContent = task.scope.topic ||
    task.scope.keywords.length > 0 ||
    task.scope.entities.length > 0 ||
    task.sources.length > 0

  return (
    <div className="flex flex-col h-full bg-muted/30">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Monitoring Task</h2>
        <p className="text-xs text-muted-foreground">Preview updates as you chat</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {!hasContent ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Start chatting to build your monitoring task</p>
            </div>
          ) : (
            <>
              <ScopeSection scope={task.scope} />
              <Separator />
              <SourcesSection sources={task.sources} />
            </>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <CreateButton disabled={!isComplete} />
      </div>
    </div>
  )
}
```

---

#### 5.2 Scope Section

**What:** Card component that displays the monitoring scope: topic, keywords (as badges), entities (with type labels), filters, and intent.

**Display elements:**
- **Topic:** Plain text, most prominent
- **Keywords:** Badge chips, removable in future iteration
- **Entities:** Outline badges with type prefix (e.g., "company: Apple")
- **Filters:** Color-coded include (green) / exclude (red)
- **Intent:** Italic, explains "why" monitoring

**Why:** Structured display makes it easy to verify the AI understood correctly. Users can see exactly what will be monitored before creating the task.

**Expected outcome:** `src/components/preview/ScopeSection.tsx` with structured layout.

- [ ] Display monitoring scope

**`src/components/preview/ScopeSection.tsx`:**
```typescript
'use client'

import { MonitoringScope } from '@/lib/schema'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Hash, Users, Filter } from 'lucide-react'

interface ScopeSectionProps {
  scope: MonitoringScope
}

export function ScopeSection({ scope }: ScopeSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="h-4 w-4" />
          Monitoring Scope
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {scope.topic && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Topic</p>
            <p className="text-sm font-medium">{scope.topic}</p>
          </div>
        )}

        {scope.keywords.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Keywords
            </p>
            <div className="flex flex-wrap gap-1">
              {scope.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {scope.entities.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Users className="h-3 w-3" />
              Entities
            </p>
            <div className="flex flex-wrap gap-1">
              {scope.entities.map((entity) => (
                <Badge
                  key={entity.id}
                  variant="outline"
                  className="text-xs"
                >
                  <span className="text-muted-foreground mr-1">{entity.type}:</span>
                  {entity.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {scope.filters.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Filters
            </p>
            <div className="space-y-1">
              {scope.filters.map((filter) => (
                <div key={filter.id} className="text-xs">
                  <span className={filter.type === 'include' ? 'text-green-600' : 'text-red-600'}>
                    {filter.type}:
                  </span>{' '}
                  {filter.pattern}
                </div>
              ))}
            </div>
          </div>
        )}

        {scope.intent && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Intent</p>
            <p className="text-xs italic">{scope.intent}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

---

#### 5.3 Sources Section

**What:** Card component that displays all configured sources with type icons, priority badges, and frequency indicators.

**Display elements:**
- **Source type icon:** Globe (website), Users (social), Newspaper (news), Rss, Code (api)
- **Source name:** Primary text
- **Priority badge:** Color-coded (red=high, yellow=medium, green=low)
- **Frequency:** Icon + text (Zap=realtime, Clock=hourly, Calendar=daily)
- **Count:** "(N)" in card header

**Why:** Visual hierarchy helps users quickly scan sources. Icons provide instant recognition of source types. Priority/frequency show monitoring intensity.

**Expected outcome:** `src/components/preview/SourcesSection.tsx` with source cards.

- [ ] Display source list

**`src/components/preview/SourcesSection.tsx`:**
```typescript
'use client'

import { Source } from '@/lib/schema'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Globe,
  Users,
  Newspaper,
  Rss,
  Code,
  Zap,
  Clock,
  Calendar
} from 'lucide-react'

interface SourcesSectionProps {
  sources: Source[]
}

const sourceIcons: Record<string, typeof Globe> = {
  website: Globe,
  social: Users,
  news: Newspaper,
  rss: Rss,
  api: Code,
}

const frequencyIcons: Record<string, typeof Zap> = {
  realtime: Zap,
  hourly: Clock,
  daily: Calendar,
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

export function SourcesSection({ sources }: SourcesSectionProps) {
  if (sources.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">No sources added yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Sources ({sources.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sources.map((source) => {
          const Icon = sourceIcons[source.type] || Globe
          const FreqIcon = frequencyIcons[source.frequency] || Clock

          return (
            <div
              key={source.id}
              className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{source.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1 py-0 ${priorityColors[source.priority]}`}
                  >
                    {source.priority}
                  </Badge>
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <FreqIcon className="h-2.5 w-2.5" />
                    {source.frequency}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
```

---

#### 5.4 Create Button

**What:** Button component that triggers task creation. Shows loading state during "API call" and success state after completion.

**States:**
1. **Disabled:** Task not complete (grayed out)
2. **Ready:** Task complete, button enabled
3. **Loading:** Creating task (spinner + "Creating...")
4. **Created:** Success state with checkmark + "Create Another" option

**Behavior:**
- Mock 1.5s delay to simulate API call
- Log task JSON to console (for demo)
- Show success toast via Sonner
- "Create Another" resets store for new task

**Why:** Per user decision, mock success toast. The state machine provides clear feedback. Console log helps debugging and demo.

**Expected outcome:** `src/components/preview/CreateButton.tsx` with loading/success states.

- [ ] Task creation action with toast

**`src/components/preview/CreateButton.tsx`:**
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useMonitoringStore } from '@/store/monitoring-store'
import { toast } from 'sonner'
import { Check, Loader2, Plus } from 'lucide-react'

interface CreateButtonProps {
  disabled?: boolean
}

export function CreateButton({ disabled }: CreateButtonProps) {
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(false)
  const { task, reset } = useMonitoringStore()

  const handleCreate = async () => {
    setLoading(true)

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    console.log('Created monitoring task:', task)

    setLoading(false)
    setCreated(true)

    toast.success('Monitoring task created!', {
      description: `Now monitoring: ${task.scope.topic || 'your topic'}`,
    })
  }

  const handleCreateAnother = () => {
    reset()
    setCreated(false)
  }

  if (created) {
    return (
      <div className="space-y-2">
        <Button className="w-full" variant="secondary" disabled>
          <Check className="h-4 w-4 mr-2" />
          Task Created
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={handleCreateAnother}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Another
        </Button>
      </div>
    )
  }

  return (
    <Button
      className="w-full"
      disabled={disabled || loading}
      onClick={handleCreate}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Creating...
        </>
      ) : (
        'Create Monitoring Task'
      )}
    </Button>
  )
}
```

---

### Phase 6: Layout & Styling

> **Goal:** Create the responsive page layout (60/40 split on desktop, stacked on mobile), configure the root layout with dark mode and toast provider, and polish global styles.

#### 6.1 Main Page

**What:** The main page component that renders the 60/40 split layout with ChatContainer on the left and PreviewPanel on the right.

**Responsive behavior:**
- **Desktop (lg+):** Horizontal split - Chat 60% | Preview 40%, full viewport height
- **Mobile (<lg):** Vertical stack - Chat 60vh on top | Preview 40vh below

**Why:** Per user decision, mobile stacks vertically. The split ratios give chat more space (where interaction happens) while keeping preview visible. Using Tailwind's `lg:` breakpoint for the switch.

**Expected outcome:** `src/app/page.tsx` with responsive flex layout.

- [ ] 60/40 split layout with responsive stacking

**`src/app/page.tsx`:**
```typescript
import { ChatContainer } from '@/components/chat/ChatContainer'
import { PreviewPanel } from '@/components/preview/PreviewPanel'

export default function Home() {
  return (
    <main className="h-screen flex flex-col lg:flex-row">
      {/* Chat Panel - 60% on desktop, full width stacked on mobile */}
      <div className="flex-1 lg:w-[60%] lg:flex-none border-b lg:border-b-0 lg:border-r h-[60vh] lg:h-full">
        <ChatContainer />
      </div>

      {/* Preview Panel - 40% on desktop, full width stacked on mobile */}
      <div className="lg:w-[40%] lg:flex-none h-[40vh] lg:h-full">
        <PreviewPanel />
      </div>
    </main>
  )
}
```

---

#### 6.2 Root Layout

**What:** The Next.js root layout that wraps all pages. Sets up dark mode, includes the Inter font, and adds the Sonner Toaster component.

**Configuration:**
- `className="dark"` on `<html>` enables dark mode by default
- Inter font from Google Fonts for clean typography
- `<Toaster position="bottom-right" />` for toast notifications
- Metadata for page title and description

**Why:** Dark mode is enabled by default (can add toggle later). Toaster must be in layout to work across all pages. Inter is a highly readable font for UI.

**Expected outcome:** `src/app/layout.tsx` with dark mode and Toaster.

- [ ] Global layout with dark mode and Toaster

**`src/app/layout.tsx`:**
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aim Monitoring - Create Monitoring Tasks',
  description: 'Create monitoring tasks through natural conversation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
```

---

#### 6.3 Global Styles

**What:** The global CSS file with Tailwind directives, CSS custom properties for theming (light/dark), and custom scrollbar styling.

**Contents:**
- `@tailwind base/components/utilities` - Core Tailwind
- `:root` CSS variables for light mode colors
- `.dark` CSS variables for dark mode colors
- Border/background defaults using variables
- Custom scrollbar styling for WebKit browsers

**Why:** CSS variables enable the shadcn theming system. The same component code works in both light/dark modes by referencing variables. Custom scrollbar improves visual polish.

**Expected outcome:** `src/app/globals.css` with theme variables and scrollbar styles.

- [ ] Tailwind imports and custom styles

**`src/app/globals.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-transparent;
}

::-webkit-scrollbar-thumb {
  @apply bg-muted-foreground/20 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-muted-foreground/30;
}
```

---

### Phase 7: Testing & Deployment

> **Goal:** Verify code quality with linting and type checking, build for production, and deploy to Vercel.

#### 7.1 Add npm scripts

**What:** Add convenience scripts to `package.json` for common operations: linting with zero warnings tolerance, type checking without emit, and the standard Next.js scripts.

**Scripts:**
- `lint:ci` - Strict lint with `--max-warnings 0` (CI-friendly)
- `type-check` - TypeScript check without building

**Why:** These scripts enable consistent code quality checks locally and in CI. The `lint:ci` variant catches warnings that would otherwise slip through.

**Expected outcome:** Updated `package.json` scripts section.

- [ ] Update package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:ci": "next lint --max-warnings 0",
    "type-check": "tsc --noEmit"
  }
}
```

---

#### 7.2 Run Checks

**What:** Run ESLint and TypeScript compiler to catch errors before building.

**Checks performed:**
- ESLint: Code style, unused imports, accessibility issues
- TypeScript: Type errors, missing types, incorrect usage

**Why:** Catching errors early saves debugging time. Both checks are fast (~seconds) compared to a full build. Running before build prevents wasted time on broken builds.

**Expected outcome:** Both commands exit with code 0 (no errors).

- [ ] Lint and type check

```bash
pnpm lint:ci
pnpm type-check
```

---

#### 7.3 Build Verification

**What:** Run the Next.js production build to compile, optimize, and bundle the application.

**Build process:**
- Compiles TypeScript to JavaScript
- Bundles and minifies code
- Generates static pages where possible
- Creates `.next` output directory

**Why:** Production build catches issues that dev mode misses (e.g., dynamic imports, edge cases). Also generates size report to check bundle size.

**Expected outcome:** Build completes successfully, `.next` folder created.

- [ ] Production build

```bash
pnpm build
```

---

#### 7.4 Vercel Deployment

**What:** Deploy the application to Vercel's edge network for global distribution and automatic HTTPS.

**Deployment options:**
1. **Vercel CLI:** `vercel --prod` for command-line deployment
2. **Git integration:** Connect repo to Vercel dashboard for automatic deploys on push

**Environment variables to configure:**
- `AZURE_OPENAI_API_KEY` - Azure API key (secret)
- `AZURE_OPENAI_RESOURCE_NAME` - Azure resource name
- `AZURE_OPENAI_MODEL` - Model ID (gpt-5-hiring)

**Why:** Vercel is optimized for Next.js with zero-config deployment. Edge functions run close to users for low latency. Free tier is sufficient for demo.

**Expected outcome:** Live URL at `*.vercel.app` with working chat functionality.

- [ ] Deploy to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel --prod
```

**Environment variables to set in Vercel:**
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_RESOURCE_NAME`
- `AZURE_OPENAI_MODEL`

---

## File Structure Summary

```
src/
├── app/
│   ├── api/chat/route.ts         # Streaming chat endpoint
│   ├── globals.css               # Tailwind + custom styles
│   ├── layout.tsx                # Root layout with Toaster
│   └── page.tsx                  # Main page (60/40 split)
├── components/
│   ├── chat/
│   │   ├── ChatContainer.tsx     # useChat hook wrapper
│   │   ├── MessageList.tsx       # Message rendering with parts
│   │   ├── MessageBubble.tsx     # Single message styling
│   │   ├── MessageInput.tsx      # Input area
│   │   ├── OptionChips.tsx       # Multi-select chips + Other
│   │   └── ReasoningBlock.tsx    # Collapsible AI reasoning
│   ├── preview/
│   │   ├── PreviewPanel.tsx      # Preview container
│   │   ├── ScopeSection.tsx      # Monitoring scope display
│   │   ├── SourcesSection.tsx    # Sources list
│   │   └── CreateButton.tsx      # Task creation + toast
│   └── ui/                       # shadcn components
├── lib/
│   ├── azure.ts                  # Azure OpenAI client
│   ├── prompt.ts                 # System prompt
│   ├── schema.ts                 # Zod schemas + types
│   ├── source-templates.ts       # Predefined source bundles
│   ├── tools.ts                  # Agent tool definitions
│   └── utils.ts                  # shadcn utilities
└── store/
    └── monitoring-store.ts       # Zustand store
```

---

## Validation Checklist

- [ ] Chat feels "current-gen" (smooth, responsive)
- [ ] Options are clickable chips (multi-select)
- [ ] "Other" button expands to text field
- [ ] AI reasoning shown in collapsible block
- [ ] Preview updates in real-time
- [ ] Source templates work correctly
- [ ] Toast shows on task creation
- [ ] Mobile layout stacks vertically
- [ ] Dark mode works correctly
- [ ] Deployed and accessible via URL
