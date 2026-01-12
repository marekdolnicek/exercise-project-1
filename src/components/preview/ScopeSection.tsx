'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MonitoringScope } from '@/lib/schema'
import { Target, Hash, Building2, Filter, MessageSquare } from 'lucide-react'

interface ScopeSectionProps {
  scope: MonitoringScope
}

export function ScopeSection({ scope }: ScopeSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="h-4 w-4" />
          Monitoring Scope
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {scope.topic && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Topic</p>
            <p className="text-sm font-medium">{scope.topic}</p>
          </div>
        )}

        {scope.keywords.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Hash className="h-3 w-3" /> Keywords
              </p>
              <div className="flex flex-wrap gap-1">
                {scope.keywords.map((keyword, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {scope.entities.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Entities
              </p>
              <div className="flex flex-wrap gap-1">
                {scope.entities.map((entity) => (
                  <Badge key={entity.id} variant="outline" className="text-xs">
                    <span className="capitalize text-muted-foreground mr-1">
                      {entity.type}:
                    </span>
                    {entity.name}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {scope.filters.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Filters
              </p>
              <div className="flex flex-wrap gap-1">
                {scope.filters.map((filter) => (
                  <Badge
                    key={filter.id}
                    variant={filter.type === 'include' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {filter.type}: {filter.pattern}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {scope.intent && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Intent
              </p>
              <p className="text-xs text-muted-foreground italic">{scope.intent}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
