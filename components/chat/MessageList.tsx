"use client";

import { useCallback, useEffect, useRef } from "react";
import { UIMessage } from "ai";
import { MessageBubble } from "./MessageBubble";
import { OptionsCard } from "./OptionsCard";
import { useMonitoringStore } from "@/lib/store/monitoring-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface MessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
  onOptionSelect: (message: string) => void;
}

export function MessageList({
  messages,
  isLoading,
  onOptionSelect,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const updateFromAgent = useMonitoringStore((state) => state.updateFromAgent);
  const addSources = useMonitoringStore((state) => state.addSources);
  const setLogic = useMonitoringStore((state) => state.setLogic);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Get text content from message parts
  const getTextContent = (message: UIMessage): string => {
    const textParts = message.parts?.filter((p) => p.type === "text") || [];
    return textParts.map((p) => (p as { type: "text"; text: string }).text).join("");
  };

  // Find tool parts in message
  const getToolParts = (message: UIMessage) => {
    return message.parts?.filter((p) => p.type === "tool-invocation") || [];
  };

  // Handle tool invocations to update store
  const handleToolPart = useCallback((toolPart: { type: string; toolName?: string; args?: unknown; state?: string }) => {
    if (toolPart.state !== "result" || !toolPart.toolName) return;

    switch (toolPart.toolName) {
      case "updateMonitoringTask": {
        const args = toolPart.args as {
          topic?: string;
          description?: string;
          keywords?: string[];
          entities?: Array<{ name: string; type: string }>;
          intent?: string;
        };
        updateFromAgent({
          topic: args.topic,
          description: args.description,
          keywords: args.keywords,
          entities: args.entities as Array<{
            name: string;
            type: "company" | "person" | "product" | "organization" | "other";
          }>,
          intent: args.intent,
        });
        break;
      }
      case "addSources": {
        const args = toolPart.args as {
          sources: Array<{
            category: string;
            name: string;
            identifier: string;
            priority?: string;
          }>;
        };
        addSources(
          args.sources.map((s) => ({
            category: s.category as
              | "website"
              | "social"
              | "news"
              | "financial"
              | "code"
              | "government"
              | "custom",
            name: s.name,
            identifier: s.identifier,
            priority: (s.priority || "medium") as "high" | "medium" | "low",
            updateFrequency: "daily" as const,
            enabled: true,
          }))
        );
        break;
      }
      case "finalizeTask": {
        const args = toolPart.args as {
          summary: string;
          rules?: Array<{ condition: string; action: string }>;
        };
        setLogic({
          summary: args.summary,
          rules: args.rules,
        });
        break;
      }
    }
  }, [updateFromAgent, addSources, setLogic]);

  // Find options to render from tool parts
  const getOptionsFromMessage = (message: UIMessage) => {
    if (message.role !== "assistant") return null;

    const toolParts = getToolParts(message);
    const optionsTool = toolParts.find(
      (t) => (t as { toolName?: string }).toolName === "presentOptions"
    ) as { toolName: string; args: unknown } | undefined;

    if (!optionsTool) return null;

    return optionsTool.args as {
      question: string;
      options: Array<{ id: string; label: string; description?: string }>;
      allowCustomInput: boolean;
      multiSelect: boolean;
    };
  };

  // Process tool parts for store updates
  useEffect(() => {
    messages.forEach((message) => {
      if (message.role === "assistant") {
        const toolParts = getToolParts(message);
        toolParts.forEach((part) =>
          handleToolPart(part as { type: string; toolName?: string; args?: unknown; state?: string })
        );
      }
    });
  }, [messages, handleToolPart]);

  const handleOptionSelect = (
    selectedIds: string[],
    customValue?: string,
    options?: Array<{ id: string; label: string }>
  ) => {
    if (customValue) {
      onOptionSelect(customValue);
    } else if (selectedIds.length > 0 && options) {
      const selectedLabels = selectedIds
        .map((id) => options.find((o) => o.id === id)?.label)
        .filter(Boolean)
        .join(", ");
      onOptionSelect(selectedLabels);
    }
  };

  return (
    <ScrollArea ref={scrollRef} className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          const textContent = getTextContent(message);
          const optionsData = getOptionsFromMessage(message);

          return (
            <div key={message.id}>
              {/* Only show message content if it exists */}
              {textContent && (
                <MessageBubble
                  role={message.role as "user" | "assistant"}
                  content={textContent}
                  isStreaming={isLastMessage && isLoading && message.role === "assistant"}
                />
              )}

              {/* Show options if this is an assistant message with presentOptions */}
              {optionsData && (
                <div className="max-w-[85%] mr-auto mt-2 ml-11">
                  <OptionsCard
                    question={optionsData.question}
                    options={optionsData.options}
                    allowCustomInput={optionsData.allowCustomInput}
                    multiSelect={optionsData.multiSelect}
                    onSelect={(ids, custom) =>
                      handleOptionSelect(ids, custom, optionsData.options)
                    }
                    disabled={!isLastMessage || isLoading}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading indicator */}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
