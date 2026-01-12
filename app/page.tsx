"use client";

import { ChatContainer } from "@/components/chat/ChatContainer";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import { Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      {/* Top header */}
      <header className="border-b px-6 py-4 bg-background">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Create Monitoring Task</h1>
            <p className="text-sm text-muted-foreground">
              Tell me what you want to monitor and I&apos;ll help you set it up
            </p>
          </div>
        </div>
      </header>

      {/* Main content - split view */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat panel - 60% */}
        <div className="w-3/5 border-r flex flex-col">
          <ChatContainer />
        </div>

        {/* Preview panel - 40% */}
        <div className="w-2/5 flex flex-col">
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}
