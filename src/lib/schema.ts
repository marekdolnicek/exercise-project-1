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
