# AI Monitoring Task Creator

A modern chat-based UI for creating monitoring tasks through natural conversation with an AI agent.

## Overview

This prototype lets users describe what they want to monitor in natural language, and an AI agent interviews them to build a structured monitoring task definition with a live preview panel.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **AI SDK**: Vercel AI SDK + Azure OpenAI
- **State**: Zustand
- **Validation**: Zod

## Features

- Natural language chat interface
- Clickable options (chips/buttons) for follow-up questions
- Live preview panel showing task being built
- Tool calling for structured agent responses
- Streaming responses

## Running Locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

## Scripts

- `pnpm dev` - Start dev server
- `pnpm build` - Build for production
- `pnpm lint:ci` - Run lint + type check

## Deployment

```bash
vercel
```

## Project Structure

```
/app
  /api/chat/route.ts    # Streaming chat API
  /page.tsx             # Main split-panel UI

/components
  /chat                 # Chat UI components
  /preview              # Preview panel components
  /ui                   # Base UI components

/lib
  /agent                # Agent tools and system prompt
  /schemas              # Zod schemas for monitoring task
  /store                # Zustand state management
```

## Agent Tools

- `presentOptions` - Present clickable options to user
- `updateMonitoringTask` - Update task scope/keywords/entities
- `addSources` - Add monitoring sources
- `finalizeTask` - Complete task with summary

## Design Decisions

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed design decisions and trade-offs.
