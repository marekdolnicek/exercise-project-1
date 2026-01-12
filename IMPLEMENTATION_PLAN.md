# Implementation Plan: AI Monitoring Task Creator

## Project Overview

Build a modern chat-based UI where users can naturally describe what they want to monitor, and an LLM agent interviews them to build a structured monitoring task definition with live preview.

**Tech Stack:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui + Vercel AI SDK + Zustand + Zod

**AI Integration:** Azure OpenAI (gpt-5-hiring) with tool calling for structured agent responses

---

## 1. Identified Ambiguities & Design Decisions

### 1.1 What is "Monitoring Scope"?

**Ambiguity:** The spec says "some representation of what we will monitor" but doesn't define the schema.

**Decision:** Model scope as a structured object with:
- `topic`: Main subject being monitored (e.g., "Tesla stock", "OpenAI announcements")
- `keywords`: Array of relevant keywords/terms
- `entities`: Named entities to track (companies, people, products)
- `filters`: Optional constraints (sentiment, date ranges, geography, languages)
- `intent`: Why the user wants to monitor this (competitive intel, research, etc.)

**Rationale:** This structure is flexible enough to handle various monitoring use cases while being concrete enough to display meaningfully in the preview panel.

---

### 1.2 What are Valid Source Types?

**Ambiguity:** "websites, feeds, social platforms, orgs, repositories, filings" are mentioned but not exhaustively defined.

**Decision:** Define a typed source schema with categories:

| Category | Examples | Identifier |
|----------|----------|------------|
| `website` | Company blogs, news sites | URL |
| `social` | Twitter/X, LinkedIn, Reddit | Handle/Subreddit |
| `news` | Bloomberg, Reuters, RSS feeds | Publication name |
| `financial` | SEC filings, earnings reports | Ticker/CIK |
| `code` | GitHub repos, npm packages | Repo name |
| `government` | Regulatory filings | Agency/docket |
| `custom` | User-defined | Custom URL |

Each source has: `category`, `name`, `identifier`, `priority` (high/medium/low), `updateFrequency` (realtime/hourly/daily/weekly)

---

### 1.3 What is "Monitoring Code/Logic"?

**Ambiguity:** The preview should show "monitoring code/logic" but this isn't defined.

**Decision:** Display as:
1. **Human-readable summary** - Natural language description of what will be monitored
2. **Structured JSON** - Machine-readable monitoring rules that could be exported
3. **Rule conditions** - If/then logic for alerts (optional enhancement)

**Example:**
```json
{
  "summary": "Monitor Tesla financial news from major sources, alert on earnings and stock movements",
  "rules": [
    { "condition": "keyword_match('earnings') AND source_type('financial')", "action": "alert_high" },
    { "condition": "entity_mention('Elon Musk')", "action": "flag_review" }
  ]
}
```

---

### 1.4 When is a Task "Complete"?

**Decision:** Task is complete when these minimum requirements are met:
- Scope has a topic AND at least one keyword or entity
- At least one source is defined
- Agent has confirmed with user OR user clicks "Create Task"

Show the "Create Monitoring Task" button in the preview panel when minimum requirements are satisfied.

---

## 2. Architecture

### 2.1 Project Structure

```
/app
  /page.tsx                    # Main page with split layout
  /layout.tsx                  # Root layout with providers
  /globals.css                 # Tailwind styles
  /api
    /chat
      /route.ts                # Streaming chat API endpoint

/components
  /chat
    /ChatContainer.tsx         # Main chat wrapper
    /MessageList.tsx           # Renders conversation history
    /MessageBubble.tsx         # Individual message (user/agent)
    /OptionsCard.tsx           # Clickable options UI (chips/cards)
    /ChatInput.tsx             # Text input + send button
  /preview
    /PreviewPanel.tsx          # Right-side preview panel
    /ScopePreview.tsx          # Monitoring scope display
    /SourcesList.tsx           # Sources list with toggles
    /LogicPreview.tsx          # JSON/code logic view
  /ui                          # shadcn/ui components

/lib
  /schemas
    /monitoring-task.ts        # Zod schemas for monitoring task
    /sources.ts                # Source type definitions
  /agent
    /system-prompt.ts          # Agent behavior & personality
    /tools.ts                  # Tool definitions for agent
  /store
    /monitoring-store.ts       # Zustand store for task state
  /utils
    /azure.ts                  # Azure OpenAI client config

/types
  /index.ts                    # Shared TypeScript types
```

---

### 2.2 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INPUT                              │
│              (typed message OR clicked option)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ChatInput Component                          │
│         Sends message to API, optimistically adds to UI         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API Route (/api/chat)                         │
│         - Receives messages array                               │
│         - Calls Azure OpenAI with tools                         │
│         - Streams response back                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  STREAMING RESPONSE                             │
│   ┌──────────────┬──────────────────┬─────────────────────┐    │
│   │  Text chunks │  Tool calls      │  Tool results       │    │
│   │  (stream)    │  (structured)    │  (updates)          │    │
│   └──────────────┴──────────────────┴─────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────────┐
│   MessageList           │     │   Zustand Store                 │
│   - Renders agent text  │     │   - monitoringTask state        │
│   - Shows OptionsCard   │     │   - Updated by tool calls       │
│   - Handles streaming   │     │   - Triggers preview update     │
└─────────────────────────┘     └─────────────────────────────────┘
                                              │
                                              ▼
                              ┌─────────────────────────────────────┐
                              │   PreviewPanel (reactive)          │
                              │   - Shows current task state       │
                              │   - Updates on every store change  │
                              │   - "Create Task" when ready       │
                              └─────────────────────────────────────┘
```

---

### 2.3 Core Schemas

```typescript
// lib/schemas/monitoring-task.ts
import { z } from 'zod';

export const EntitySchema = z.object({
  name: z.string(),
  type: z.enum(['company', 'person', 'product', 'organization', 'other'])
});

export const FilterSchema = z.object({
  sentiment: z.enum(['positive', 'negative', 'neutral', 'all']).optional(),
  dateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional()
  }).optional(),
  languages: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional()
});

export const ScopeSchema = z.object({
  topic: z.string(),
  description: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  entities: z.array(EntitySchema).default([]),
  filters: FilterSchema.optional(),
  intent: z.string().optional()
});

export const SourceSchema = z.object({
  id: z.string(),
  category: z.enum(['website', 'social', 'news', 'financial', 'code', 'government', 'custom']),
  name: z.string(),
  identifier: z.string(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  updateFrequency: z.enum(['realtime', 'hourly', 'daily', 'weekly']).default('daily'),
  enabled: z.boolean().default(true)
});

export const LogicSchema = z.object({
  summary: z.string(),
  rules: z.array(z.object({
    condition: z.string(),
    action: z.string()
  })).optional()
});

export const MonitoringTaskSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['draft', 'ready', 'active']).default('draft'),
  createdAt: z.string(),
  scope: ScopeSchema.partial(),
  sources: z.array(SourceSchema).default([]),
  logic: LogicSchema.optional()
});

export type MonitoringTask = z.infer<typeof MonitoringTaskSchema>;
```

---

### 2.4 Agent Tools

```typescript
// lib/agent/tools.ts
import { z } from 'zod';

export const agentTools = {
  // Present clickable options to the user
  presentOptions: {
    description: "Present options to the user as clickable chips/cards. Use this instead of asking them to type A/B/C.",
    parameters: z.object({
      question: z.string().describe("The question to ask the user"),
      options: z.array(z.object({
        id: z.string().describe("Unique ID for this option"),
        label: z.string().describe("Short display text (2-4 words)"),
        description: z.string().optional().describe("Longer explanation if needed")
      })).min(2).max(6),
      allowCustomInput: z.boolean().default(true).describe("Allow user to type custom answer"),
      multiSelect: z.boolean().default(false).describe("Allow selecting multiple options")
    })
  },

  // Update parts of the monitoring task
  updateMonitoringTask: {
    description: "Update the monitoring task being built. Call this whenever you learn new information about what the user wants to monitor.",
    parameters: z.object({
      topic: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      entities: z.array(z.object({
        name: z.string(),
        type: z.enum(['company', 'person', 'product', 'organization', 'other'])
      })).optional(),
      intent: z.string().optional()
    })
  },

  // Add sources to monitor
  addSources: {
    description: "Add sources to the monitoring task",
    parameters: z.object({
      sources: z.array(z.object({
        category: z.enum(['website', 'social', 'news', 'financial', 'code', 'government', 'custom']),
        name: z.string(),
        identifier: z.string(),
        priority: z.enum(['high', 'medium', 'low']).default('medium')
      }))
    })
  },

  // Mark task as ready for creation
  finalizeTask: {
    description: "Call when the monitoring task has enough information and is ready for creation",
    parameters: z.object({
      summary: z.string().describe("Human-readable summary of what will be monitored")
    })
  }
};
```

---

## 3. UI Design

### 3.1 Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [Logo] Create Monitoring Task                              [Dark Mode]  │
├────────────────────────────────────────────┬─────────────────────────────┤
│                                            │                             │
│  CHAT AREA (60% width)                     │  PREVIEW PANEL (40%)        │
│                                            │                             │
│  ┌──────────────────────────────────────┐  │  ┌───────────────────────┐  │
│  │ 🤖 Hi! I'll help you set up         │  │  │ MONITORING SCOPE      │  │
│  │ monitoring. What would you like to  │  │  │ ─────────────────────  │  │
│  │ keep track of?                      │  │  │ Topic: Tesla          │  │
│  └──────────────────────────────────────┘  │  │ Keywords:             │  │
│                                            │  │  • stock              │  │
│  ┌──────────────────────────────────────┐  │  │  • earnings           │  │
│  │ 👤 I want to monitor Tesla news     │  │  │  • financial          │  │
│  └──────────────────────────────────────┘  │  │ Entities:             │  │
│                                            │  │  • Tesla Inc (company)│  │
│  ┌──────────────────────────────────────┐  │  └───────────────────────┘  │
│  │ 🤖 Great! What aspects interest you │  │                             │
│  │ most?                               │  │  ┌───────────────────────┐  │
│  │                                      │  │  │ SOURCES               │  │
│  │ ┌─────────┐ ┌────────────────────┐  │  │  │ ─────────────────────  │  │
│  │ │ Stock & │ │ Product            │  │  │  │ ✓ Bloomberg (news)    │  │
│  │ │ Finance │ │ Announcements      │  │  │  │ ✓ SEC Filings         │  │
│  │ └─────────┘ └────────────────────┘  │  │  │ ✓ Twitter/X           │  │
│  │ ┌─────────┐ ┌─────────────────────┐ │  │  │ ○ Reddit              │  │
│  │ │ Elon    │ │ All of the above   │ │  │  └───────────────────────┘  │
│  │ │ Updates │ │                    │ │  │                             │
│  │ └─────────┘ └─────────────────────┘ │  │  ┌───────────────────────┐  │
│  │                                      │  │  │ LOGIC PREVIEW         │  │
│  │ [Or type your own answer...]        │  │  │ ─────────────────────  │  │
│  └──────────────────────────────────────┘  │  │ {                     │  │
│                                            │  │   "summary": "..."    │  │
│  ┌──────────────────────────────────────┐  │  │ }                     │  │
│  │ Type a message...              [→]  │  │  └───────────────────────┘  │
│  └──────────────────────────────────────┘  │                             │
│                                            │  ┌───────────────────────┐  │
│                                            │  │ [CREATE TASK]         │  │
│                                            │  └───────────────────────┘  │
└────────────────────────────────────────────┴─────────────────────────────┘
```

### 3.2 Component Styling Notes

- **Chat bubbles:** Rounded corners (lg), subtle shadow, agent=left gray, user=right blue
- **Options chips:** Pill-shaped buttons with hover states, can be single/multi-select
- **Preview panel:** Sticky position, card-based sections, smooth update animations
- **Color scheme:** Clean white/gray palette, accent color for CTAs
- **Typography:** Inter for UI, JetBrains Mono for code/JSON

---

## 4. Implementation Phases

### Phase 1: Project Setup
**Files:** 8 | **Commands:** 5

1. `pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir=false`
2. Install deps: `pnpm add @ai-sdk/azure ai zod zustand nanoid`
3. Setup shadcn/ui: `pnpm dlx shadcn@latest init`
4. Add components: `pnpm dlx shadcn@latest add button card input scroll-area badge`
5. Create folder structure
6. Configure Azure OpenAI client

---

### Phase 2: Schemas & State
**Files:** 4

1. `lib/schemas/monitoring-task.ts` - Zod schemas
2. `lib/schemas/sources.ts` - Source type definitions
3. `lib/store/monitoring-store.ts` - Zustand store
4. `types/index.ts` - TypeScript types

---

### Phase 3: Agent & API
**Files:** 3

1. `lib/agent/tools.ts` - Tool definitions
2. `lib/agent/system-prompt.ts` - Agent personality & behavior
3. `app/api/chat/route.ts` - Streaming chat endpoint

---

### Phase 4: Chat UI
**Files:** 6

1. `components/chat/ChatContainer.tsx` - Main wrapper with useChat
2. `components/chat/MessageList.tsx` - Renders messages array
3. `components/chat/MessageBubble.tsx` - Single message display
4. `components/chat/OptionsCard.tsx` - Clickable options UI
5. `components/chat/ChatInput.tsx` - Input + send button
6. Handle tool call rendering in stream

---

### Phase 5: Preview Panel
**Files:** 4

1. `components/preview/PreviewPanel.tsx` - Container
2. `components/preview/ScopePreview.tsx` - Scope details
3. `components/preview/SourcesList.tsx` - Sources with toggles
4. `components/preview/LogicPreview.tsx` - JSON view

---

### Phase 6: Main Page & Integration
**Files:** 2

1. `app/page.tsx` - Split layout with chat + preview
2. `app/layout.tsx` - Providers, fonts, metadata

---

### Phase 7: Polish & Deploy
**Tasks:**
1. Add loading states and animations
2. Error handling (API failures, rate limits)
3. Responsive design (mobile stacks vertically)
4. Dark mode support
5. Deploy to Vercel
6. Test with provided Azure credentials

---

## 5. Trade-offs Made

| Decision | Trade-off | Rationale |
|----------|-----------|-----------|
| Tool calling over structured output | More complex, but enables rich UI | Options appear as clickable cards |
| Zustand over React Context | Extra dependency | Better DX for cross-component state |
| shadcn/ui over custom components | Setup time | Saves significant styling effort |
| Streaming responses | Complex handling | Much better UX, feels responsive |
| Client-side state for task | No persistence | Simpler for prototype, can add DB later |

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Agent doesn't use tools correctly | Options appear as text | Strong system prompt, examples |
| Azure rate limiting | API errors | Graceful error handling, retry |
| Streaming + tool calls complex | Partial renders | Use AI SDK's built-in handling |
| Preview gets out of sync | Confusing UX | Single source of truth (Zustand) |
| Mobile layout breaks | Poor UX | Stack layout vertically on mobile |

---

## 7. Future Enhancements (One More Week)

1. **Persistence** - Save tasks to database, resume later
2. **Task editing** - Modify existing tasks through chat
3. **Source validation** - Verify URLs/sources are accessible
4. **Templates** - Pre-built monitoring task starters
5. **Export** - Download task definition as JSON/YAML
6. **Webhooks** - Configure where alerts are sent
7. **Multi-task** - Create and manage multiple monitoring tasks
8. **Real preview** - Show sample monitored data

---

## 8. Verification Checklist

- [ ] Chat sends messages and receives streaming responses
- [ ] Agent uses tools to present clickable options
- [ ] Clicking option sends it as user message
- [ ] User can type custom answer instead
- [ ] Preview panel updates when agent calls updateTask
- [ ] Sources list shows added sources
- [ ] Logic preview shows JSON representation
- [ ] "Create Task" button appears when ready
- [ ] Works on mobile (responsive)
- [ ] Deployed to Vercel successfully

---

## 9. Demo Flow for Video

1. **Intro** (30s) - Show the finished app, explain what it does
2. **UX walkthrough** (2min) - Live demo creating a monitoring task
3. **Code tour** (3min) - Show schema, tools, API route, components
4. **Agent design** (2min) - Explain tool calling approach
5. **Trade-offs** (1min) - Key decisions and alternatives
6. **Future work** (1min) - What you'd build next
7. **Risks** (30s) - What you'd validate

---

*Plan created: January 12, 2025*
