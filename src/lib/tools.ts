import { tool, ToolSet } from 'ai'
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
    // No execute - client-side tool for UI rendering
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
    execute: async (input) => ({ success: true, templateId: input.templateId }),
  }),

  confirmTask: tool({
    description: 'Mark task complete',
    inputSchema: z.object({ summary: z.string() }),
    execute: async (input) => ({ success: true, summary: input.summary, status: 'ready' }),
  }),
} satisfies ToolSet
