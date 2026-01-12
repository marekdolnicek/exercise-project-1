import { Source } from './schema'

export interface SourceTemplate {
  id: string
  name: string
  description: string
  icon: string
  sources: Source[]
}

export const sourceTemplates: SourceTemplate[] = [
  {
    id: 'tech-news',
    name: 'Tech News Bundle',
    description: 'TechCrunch, The Verge, Ars Technica, Hacker News',
    icon: 'Newspaper',
    sources: [
      { id: 'tn-1', type: 'news', name: 'TechCrunch', url: 'https://techcrunch.com', priority: 'high', frequency: 'hourly', enabled: true },
      { id: 'tn-2', type: 'news', name: 'The Verge', url: 'https://theverge.com', priority: 'high', frequency: 'hourly', enabled: true },
      { id: 'tn-3', type: 'news', name: 'Ars Technica', priority: 'medium', frequency: 'daily', enabled: true },
      { id: 'tn-4', type: 'rss', name: 'Hacker News', url: 'https://news.ycombinator.com/rss', priority: 'medium', frequency: 'hourly', enabled: true },
    ],
  },
  {
    id: 'social-media',
    name: 'Social Media Bundle',
    description: 'Twitter/X, LinkedIn, Reddit',
    icon: 'Users',
    sources: [
      { id: 'sm-1', type: 'social', name: 'Twitter/X', priority: 'high', frequency: 'realtime', enabled: true },
      { id: 'sm-2', type: 'social', name: 'LinkedIn', priority: 'medium', frequency: 'hourly', enabled: true },
      { id: 'sm-3', type: 'social', name: 'Reddit', priority: 'medium', frequency: 'hourly', enabled: true },
    ],
  },
  {
    id: 'financial-news',
    name: 'Financial News Bundle',
    description: 'Bloomberg, Reuters, Financial Times',
    icon: 'TrendingUp',
    sources: [
      { id: 'fn-1', type: 'news', name: 'Bloomberg', priority: 'high', frequency: 'realtime', enabled: true },
      { id: 'fn-2', type: 'news', name: 'Reuters', priority: 'high', frequency: 'realtime', enabled: true },
      { id: 'fn-3', type: 'news', name: 'Financial Times', priority: 'high', frequency: 'hourly', enabled: true },
    ],
  },
  {
    id: 'regulatory',
    name: 'Regulatory & Filings',
    description: 'SEC EDGAR, Federal Register',
    icon: 'FileText',
    sources: [
      { id: 'rg-1', type: 'api', name: 'SEC EDGAR', priority: 'high', frequency: 'daily', enabled: true },
      { id: 'rg-2', type: 'website', name: 'Federal Register', priority: 'medium', frequency: 'daily', enabled: true },
    ],
  },
  {
    id: 'developer',
    name: 'Developer Sources',
    description: 'GitHub, Stack Overflow, Dev.to',
    icon: 'Code',
    sources: [
      { id: 'dv-1', type: 'api', name: 'GitHub', priority: 'high', frequency: 'hourly', enabled: true },
      { id: 'dv-2', type: 'website', name: 'Stack Overflow', priority: 'medium', frequency: 'daily', enabled: true },
      { id: 'dv-3', type: 'rss', name: 'Dev.to', priority: 'low', frequency: 'daily', enabled: true },
    ],
  },
]

export const getTemplateById = (id: string) => sourceTemplates.find(t => t.id === id)
