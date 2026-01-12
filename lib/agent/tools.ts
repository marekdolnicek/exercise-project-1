import { z } from "zod";
import { tool } from "ai";

// Tool for presenting clickable options to the user
export const presentOptions = tool({
  description:
    "Present options to the user as clickable chips/cards. ALWAYS use this instead of asking users to type A/B/C or listing options in text. This creates a rich interactive UI.",
  inputSchema: z.object({
    question: z
      .string()
      .describe("The question to ask the user, displayed above the options"),
    options: z
      .array(
        z.object({
          id: z.string().describe("Unique ID for this option (lowercase, no spaces)"),
          label: z.string().describe("Short display text (2-5 words)"),
          description: z
            .string()
            .optional()
            .describe("Optional longer explanation for complex options"),
        })
      )
      .min(2)
      .max(6)
      .describe("The options to present to the user"),
    allowCustomInput: z
      .boolean()
      .default(true)
      .describe("Whether to show a 'Type your own' option"),
    multiSelect: z
      .boolean()
      .default(false)
      .describe("Whether user can select multiple options"),
  }),
});

// Tool for updating the monitoring task
export const updateMonitoringTask = tool({
  description:
    "Update the monitoring task being built. Call this whenever you learn new information about what the user wants to monitor. The updates will appear in the live preview panel.",
  inputSchema: z.object({
    topic: z
      .string()
      .optional()
      .describe("Main subject being monitored (e.g., 'Tesla news', 'OpenAI announcements')"),
    description: z
      .string()
      .optional()
      .describe("Brief description of the monitoring goal"),
    keywords: z
      .array(z.string())
      .optional()
      .describe("Keywords to track (e.g., ['stock', 'earnings', 'price'])"),
    entities: z
      .array(
        z.object({
          name: z.string().describe("Entity name"),
          type: z
            .enum(["company", "person", "product", "organization", "other"])
            .describe("Entity type"),
        })
      )
      .optional()
      .describe("Named entities to track (companies, people, products)"),
    intent: z
      .string()
      .optional()
      .describe("Why the user wants to monitor this (e.g., 'competitive intelligence', 'investment research')"),
  }),
});

// Tool for adding sources
export const addSources = tool({
  description:
    "Add monitoring sources to the task. Call this when suggesting or confirming sources to monitor.",
  inputSchema: z.object({
    sources: z
      .array(
        z.object({
          category: z
            .enum([
              "website",
              "social",
              "news",
              "financial",
              "code",
              "government",
              "custom",
            ])
            .describe("Category of the source"),
          name: z.string().describe("Display name for the source"),
          identifier: z
            .string()
            .describe("URL, handle, or identifier for the source"),
          priority: z
            .enum(["high", "medium", "low"])
            .default("medium")
            .describe("Priority level for this source"),
        })
      )
      .min(1)
      .describe("Sources to add to the monitoring task"),
  }),
});

// Tool for finalizing the task
export const finalizeTask = tool({
  description:
    "Call when the monitoring task has enough information and is ready for creation. This generates the final monitoring logic.",
  inputSchema: z.object({
    summary: z
      .string()
      .describe(
        "Human-readable summary of what will be monitored (1-2 sentences)"
      ),
    rules: z
      .array(
        z.object({
          condition: z.string().describe("When to trigger (e.g., 'keyword match')"),
          action: z.string().describe("What to do (e.g., 'alert', 'flag')"),
        })
      )
      .optional()
      .describe("Optional monitoring rules"),
  }),
});

// All tools combined
export const agentTools = {
  presentOptions,
  updateMonitoringTask,
  addSources,
  finalizeTask,
};
