'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Source } from '@/lib/schema'
import { Rss, Globe, Share2, Newspaper, Code, Clock, Zap, Sun } from 'lucide-react'

interface SourcesSectionProps {
  sources: Source[]
}

const typeIcons: Record<string, React.ReactNode> = {
  rss: <Rss className="h-4 w-4" />,
  website: <Globe className="h-4 w-4" />,
  social: <Share2 className="h-4 w-4" />,
  news: <Newspaper className="h-4 w-4" />,
  api: <Code className="h-4 w-4" />,
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
}

const frequencyIcons: Record<string, React.ReactNode> = {
  realtime: <Zap className="h-3 w-3" />,
  hourly: <Clock className="h-3 w-3" />,
  daily: <Sun className="h-3 w-3" />,
}

export function SourcesSection({ sources }: SourcesSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Rss className="h-4 w-4" />
          Sources ({sources.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sources.map((source) => (
            <div
              key={source.id}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
            >
              <div className="flex items-center gap-2">
                {typeIcons[source.type] || <Globe className="h-4 w-4" />}
                <span>{source.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={priorityColors[source.priority]}>
                  {source.priority}
                </Badge>
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  {frequencyIcons[source.frequency]}
                  {source.frequency}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
