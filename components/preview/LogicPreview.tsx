"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonitoringTask } from "@/types";
import { Code, Copy, Check, FileJson } from "lucide-react";

interface LogicPreviewProps {
  task: MonitoringTask;
}

export function LogicPreview({ task }: LogicPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [showFull, setShowFull] = useState(false);

  // Generate a clean JSON representation
  const taskJson = JSON.stringify(
    {
      id: task.id,
      status: task.status,
      scope: {
        topic: task.scope.topic || undefined,
        keywords: task.scope.keywords.length > 0 ? task.scope.keywords : undefined,
        entities: task.scope.entities.length > 0 ? task.scope.entities : undefined,
        intent: task.scope.intent || undefined,
      },
      sources: task.sources.map((s) => ({
        category: s.category,
        name: s.name,
        identifier: s.identifier,
        priority: s.priority,
        enabled: s.enabled,
      })),
      logic: task.logic,
    },
    null,
    2
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(taskJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasLogic = task.logic?.summary;
  const hasContent =
    task.scope.topic ||
    task.scope.keywords.length > 0 ||
    task.sources.length > 0;

  if (!hasContent) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            Task Definition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            The monitoring task definition will appear here...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            Task Definition
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowFull(!showFull)}
            >
              <Code className="h-3 w-3 mr-1" />
              {showFull ? "Summary" : "Full JSON"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary view */}
        {!showFull && (
          <div className="space-y-3">
            {hasLogic && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Summary
                </p>
                <p className="text-sm">{task.logic?.summary}</p>
              </div>
            )}

            {task.logic?.rules && task.logic.rules.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Rules
                </p>
                <div className="space-y-1.5">
                  {task.logic.rules.map((rule, index) => (
                    <div
                      key={index}
                      className="p-2 bg-muted/50 rounded text-xs font-mono"
                    >
                      <span className="text-blue-600 dark:text-blue-400">
                        IF
                      </span>{" "}
                      {rule.condition}{" "}
                      <span className="text-green-600 dark:text-green-400">
                        THEN
                      </span>{" "}
                      {rule.action}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasLogic && (
              <p className="text-sm text-muted-foreground italic">
                Continue chatting to finalize the monitoring logic...
              </p>
            )}
          </div>
        )}

        {/* Full JSON view */}
        {showFull && (
          <pre className="p-3 bg-muted rounded-lg text-xs font-mono overflow-x-auto max-h-[300px] overflow-y-auto">
            {taskJson}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
