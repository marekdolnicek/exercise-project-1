"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useMemo } from "react";

export function ChatContainer() {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    []
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi! I'm here to help you create a monitoring task. What would you like to keep track of? For example, you could say \"I want to monitor Tesla news\" or \"Track my competitor's product launches\".",
        parts: [
          {
            type: "text",
            text: "Hi! I'm here to help you create a monitoring task. What would you like to keep track of? For example, you could say \"I want to monitor Tesla news\" or \"Track my competitor's product launches\".",
          },
        ],
      },
    ],
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSendMessage = (message: string) => {
    sendMessage({ text: message });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold text-lg">Chat</h2>
        <p className="text-sm text-muted-foreground">
          Describe what you want to monitor
        </p>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        onOptionSelect={handleSendMessage}
      />

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        isLoading={isLoading}
        placeholder="Type your message or click an option above..."
      />
    </div>
  );
}
