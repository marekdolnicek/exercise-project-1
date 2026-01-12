"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Source, SourceCategory } from "@/types";
import { useMonitoringStore } from "@/lib/store/monitoring-store";
import {
  Globe,
  Users,
  Newspaper,
  TrendingUp,
  Code,
  Building,
  Settings,
  X,
  Database,
} from "lucide-react";

interface SourcesListProps {
  sources: Source[];
}

const categoryIcons: Record<SourceCategory, React.ReactNode> = {
  website: <Globe className="h-3.5 w-3.5" />,
  social: <Users className="h-3.5 w-3.5" />,
  news: <Newspaper className="h-3.5 w-3.5" />,
  financial: <TrendingUp className="h-3.5 w-3.5" />,
  code: <Code className="h-3.5 w-3.5" />,
  government: <Building className="h-3.5 w-3.5" />,
  custom: <Settings className="h-3.5 w-3.5" />,
};

const priorityColors: Record<Source["priority"], string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export function SourcesList({ sources }: SourcesListProps) {
  const toggleSource = useMonitoringStore((state) => state.toggleSource);
  const removeSource = useMonitoringStore((state) => state.removeSource);

  if (sources.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            No sources added yet...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group sources by category
  const groupedSources = sources.reduce(
    (acc, source) => {
      if (!acc[source.category]) {
        acc[source.category] = [];
      }
      acc[source.category].push(source);
      return acc;
    },
    {} as Record<SourceCategory, Source[]>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Database className="h-4 w-4" />
          Sources
          <Badge variant="secondary" className="ml-auto text-xs">
            {sources.filter((s) => s.enabled).length}/{sources.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedSources).map(([category, categorySources]) => (
          <div key={category}>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5 capitalize">
              {categoryIcons[category as SourceCategory]}
              {category}
            </p>
            <div className="space-y-1.5">
              {categorySources.map((source) => (
                <div
                  key={source.id}
                  className={`flex items-center gap-2 p-2 rounded-md border transition-opacity ${
                    source.enabled ? "bg-background" : "bg-muted/50 opacity-60"
                  }`}
                >
                  <button
                    onClick={() => toggleSource(source.id)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      source.enabled
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground"
                    }`}
                  >
                    {source.enabled && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{source.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {source.identifier}
                    </p>
                  </div>
                  <Badge
                    className={`text-xs shrink-0 ${priorityColors[source.priority]}`}
                    variant="outline"
                  >
                    {source.priority}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => removeSource(source.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
