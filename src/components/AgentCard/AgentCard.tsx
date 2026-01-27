import { FileCode, Terminal, Search, Edit3, Globe, Database } from 'lucide-react'
import type { Agent } from '@/types'

interface AgentCardProps {
  agent: Agent
  onClick: () => void
}

function AgentCard({ agent, onClick }: AgentCardProps) {
  const toolIcons = {
    read: FileCode,
    write: Edit3,
    edit: FileCode,
    bash: Terminal,
    grep: Search,
    glob: Globe,
    lsp: Database,
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold">{agent.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${
          agent.mode === 'subagent' 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
            : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
        }`}>
          {agent.mode}
        </span>
      </div>
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span className="font-mono bg-muted px-2 py-0.5 rounded">{agent.model}</span>
        <span>temp: {agent.temperature}</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {Object.entries(agent.tools).map(([tool, enabled]) => {
          if (!enabled) return null
          const Icon = toolIcons[tool as keyof typeof toolIcons] || FileCode
          return (
            <div
              key={tool}
              className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded"
              title={tool}
            >
              <Icon className="w-3 h-3" />
              <span className="capitalize">{tool}</span>
            </div>
          )
        })}
      </div>
    </button>
  )
}

export default AgentCard
