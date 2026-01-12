"use client";

import { useMonitoringStore } from "@/lib/store/monitoring-store";
import { ScopePreview } from "./ScopePreview";
import { SourcesList } from "./SourcesList";
import { LogicPreview } from "./LogicPreview";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, RotateCcw, Sparkles } from "lucide-react";

export function PreviewPanel() {
  const task = useMonitoringStore((state) => state.task);
  const isReady = useMonitoringStore((state) => state.isReady);
  const reset = useMonitoringStore((state) => state.reset);
  const markReady = useMonitoringStore((state) => state.markReady);

  const handleCreateTask = () => {
    markReady();
    // In a real app, this would save to a database
    alert(
      "Monitoring task created! In a real app, this would save to your dashboard."
    );
  };

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Header */}
      <div className="border-b px-4 py-3 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Preview
            </h2>
            <p className="text-sm text-muted-foreground">
              Live task configuration
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Preview content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <ScopePreview scope={task.scope} />
          <SourcesList sources={task.sources} />
          <LogicPreview task={task} />
        </div>
      </ScrollArea>

      {/* Create button */}
      <div className="border-t p-4 bg-background">
        <Button
          className="w-full"
          size="lg"
          disabled={!isReady || task.status === "ready"}
          onClick={handleCreateTask}
        >
          {task.status === "ready" ? (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Task Created
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              {isReady ? "Create Monitoring Task" : "Complete setup to create"}
            </>
          )}
        </Button>
        {!isReady && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            Add a topic and at least one source to enable
          </p>
        )}
      </div>
    </div>
  );
}
