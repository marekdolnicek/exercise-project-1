"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scope, Entity } from "@/types";
import { Target, Hash, Users, Lightbulb } from "lucide-react";

interface ScopePreviewProps {
  scope: Scope;
}

const entityTypeColors: Record<Entity["type"], string> = {
  company: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  person: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  product: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  organization: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export function ScopePreview({ scope }: ScopePreviewProps) {
  const hasContent =
    scope.topic ||
    scope.keywords.length > 0 ||
    scope.entities.length > 0 ||
    scope.intent;

  if (!hasContent) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Monitoring Scope
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            Start chatting to define what you want to monitor...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4" />
          Monitoring Scope
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Topic */}
        {scope.topic && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Topic
            </p>
            <p className="text-sm font-semibold">{scope.topic}</p>
            {scope.description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {scope.description}
              </p>
            )}
          </div>
        )}

        {/* Keywords */}
        {scope.keywords.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Keywords
            </p>
            <div className="flex flex-wrap gap-1.5">
              {scope.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Entities */}
        {scope.entities.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Users className="h-3 w-3" />
              Entities
            </p>
            <div className="flex flex-wrap gap-1.5">
              {scope.entities.map((entity) => (
                <Badge
                  key={entity.name}
                  className={`text-xs ${entityTypeColors[entity.type]}`}
                  variant="outline"
                >
                  {entity.name}
                  <span className="ml-1 opacity-60">({entity.type})</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Intent */}
        {scope.intent && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Intent
            </p>
            <p className="text-sm">{scope.intent}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
