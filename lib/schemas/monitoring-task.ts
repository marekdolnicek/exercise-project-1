import { z } from "zod";

// Entity schema for tracking companies, people, products, etc.
export const EntitySchema = z.object({
  name: z.string(),
  type: z.enum(["company", "person", "product", "organization", "other"]),
});

// Filter schema for constraining monitoring scope
export const FilterSchema = z.object({
  sentiment: z.enum(["positive", "negative", "neutral", "all"]).optional(),
  dateRange: z
    .object({
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
  languages: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
});

// Monitoring scope - what to monitor
export const ScopeSchema = z.object({
  topic: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  entities: z.array(EntitySchema).default([]),
  filters: FilterSchema.optional(),
  intent: z.string().optional(),
});

// Source category types
export const SourceCategorySchema = z.enum([
  "website",
  "social",
  "news",
  "financial",
  "code",
  "government",
  "custom",
]);

// Source schema - where to monitor
export const SourceSchema = z.object({
  id: z.string(),
  category: SourceCategorySchema,
  name: z.string(),
  identifier: z.string(), // URL, handle, repo name, etc.
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  updateFrequency: z
    .enum(["realtime", "hourly", "daily", "weekly"])
    .default("daily"),
  enabled: z.boolean().default(true),
});

// Monitoring rule schema
export const RuleSchema = z.object({
  condition: z.string(),
  action: z.string(),
});

// Monitoring logic schema
export const LogicSchema = z.object({
  summary: z.string(),
  rules: z.array(RuleSchema).optional(),
});

// Full monitoring task schema
export const MonitoringTaskSchema = z.object({
  id: z.string(),
  status: z.enum(["draft", "ready", "active"]).default("draft"),
  createdAt: z.string(),
  scope: ScopeSchema,
  sources: z.array(SourceSchema).default([]),
  logic: LogicSchema.optional(),
});

// Types
export type Entity = z.infer<typeof EntitySchema>;
export type Filter = z.infer<typeof FilterSchema>;
export type Scope = z.infer<typeof ScopeSchema>;
export type SourceCategory = z.infer<typeof SourceCategorySchema>;
export type Source = z.infer<typeof SourceSchema>;
export type Rule = z.infer<typeof RuleSchema>;
export type Logic = z.infer<typeof LogicSchema>;
export type MonitoringTask = z.infer<typeof MonitoringTaskSchema>;

// Helper to create empty monitoring task
export function createEmptyMonitoringTask(): MonitoringTask {
  return {
    id: crypto.randomUUID(),
    status: "draft",
    createdAt: new Date().toISOString(),
    scope: {
      keywords: [],
      entities: [],
    },
    sources: [],
  };
}

// Helper to check if task meets minimum requirements
export function isTaskReady(task: MonitoringTask): boolean {
  const hasScope =
    !!task.scope.topic ||
    task.scope.keywords.length > 0 ||
    task.scope.entities.length > 0;
  const hasSources = task.sources.length > 0;
  return hasScope && hasSources;
}
