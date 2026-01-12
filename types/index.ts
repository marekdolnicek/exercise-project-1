// Re-export all types from schemas
export type {
  Entity,
  Filter,
  Scope,
  SourceCategory,
  Source,
  Rule,
  Logic,
  MonitoringTask,
} from "@/lib/schemas/monitoring-task";

// Chat-related types
export interface ChatOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface OptionsCardData {
  question: string;
  options: ChatOption[];
  allowCustomInput: boolean;
  multiSelect: boolean;
}

// Message types for the chat
export interface AgentMessage {
  id: string;
  role: "assistant";
  content: string;
  toolInvocations?: ToolInvocation[];
}

export interface UserMessage {
  id: string;
  role: "user";
  content: string;
}

export type Message = AgentMessage | UserMessage;

// Tool invocation types
export interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: "pending" | "result" | "error";
  result?: unknown;
}

// Source category display info
export const SOURCE_CATEGORY_INFO: Record<
  string,
  { label: string; icon: string; description: string }
> = {
  website: {
    label: "Website",
    icon: "Globe",
    description: "Specific websites and web pages",
  },
  social: {
    label: "Social Media",
    icon: "Users",
    description: "Twitter/X, LinkedIn, Reddit, etc.",
  },
  news: {
    label: "News",
    icon: "Newspaper",
    description: "News outlets and RSS feeds",
  },
  financial: {
    label: "Financial",
    icon: "TrendingUp",
    description: "SEC filings, earnings reports, stock data",
  },
  code: {
    label: "Code",
    icon: "Code",
    description: "GitHub repos, npm packages, code changes",
  },
  government: {
    label: "Government",
    icon: "Building",
    description: "Regulatory filings, government announcements",
  },
  custom: {
    label: "Custom",
    icon: "Settings",
    description: "User-defined custom sources",
  },
};
