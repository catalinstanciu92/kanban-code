import { useState } from 'react'
import {
  FileCode,
  Terminal,
  Search,
  Edit3,
  Globe,
  Database,
  Bot,
  Cpu,
  Thermometer,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Agent } from '@/types'

interface AgentCardProps {
  agent: Agent
  onClick: () => void
}

// Tool configuration with icons and grouping
const TOOL_CONFIG = {
  read: { icon: FileCode, label: 'Read Files', group: 'file' },
  write: { icon: Edit3, label: 'Write Files', group: 'file' },
  edit: { icon: FileCode, label: 'Edit Files', group: 'file' },
  bash: { icon: Terminal, label: 'Terminal', group: 'system' },
  grep: { icon: Search, label: 'Search', group: 'system' },
  glob: { icon: Globe, label: 'File Glob', group: 'system' },
  lsp: { icon: Database, label: 'LSP', group: 'system' },
} as const

function AgentCard({ agent, onClick }: AgentCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  // Get temperature color indicator
  const getTemperatureColor = (temp: number) => {
    if (temp <= 0.3) return 'bg-blue-500'
    if (temp <= 0.7) return 'bg-amber-500'
    return 'bg-rose-500'
  }

  // Get temperature label
  const getTemperatureLabel = (temp: number) => {
    if (temp <= 0.3) return 'Focused'
    if (temp <= 0.7) return 'Balanced'
    return 'Creative'
  }

  // Group enabled tools
  const enabledTools = Object.entries(agent.tools)
    .filter(([, enabled]) => enabled)
    .map(([tool]) => ({
      key: tool,
      ...TOOL_CONFIG[tool as keyof typeof TOOL_CONFIG],
    }))

  const fileTools = enabledTools.filter((t) => t.group === 'file')
  const systemTools = enabledTools.filter((t) => t.group === 'system')

  return (
    <TooltipProvider delayDuration={200}>
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setIsPressed(false)
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        className={`
          w-full text-left rounded-xl border overflow-hidden
          bg-card/70 backdrop-blur-md backdrop-saturate-150
          border-border/50
          shadow-sm
          transition-all duration-300 ease-out
          cursor-pointer
          group
          ${isHovered ? 'shadow-xl -translate-y-1 bg-card/80' : ''}
          ${isPressed ? 'scale-[0.98] shadow-md' : ''}
        `}
      >
        {/* Glassmorphism shine effect */}
        <div
          className={`
            absolute inset-0 opacity-0 transition-opacity duration-500
            bg-gradient-to-br from-primary/10 via-transparent to-transparent
            ${isHovered ? 'opacity-100' : ''}
          `}
        />

        <div className="relative p-5">
          {/* Header Section */}
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar/Icon Area */}
            <div
              className={`
                flex-shrink-0 w-12 h-12 rounded-xl
                flex items-center justify-center
                bg-gradient-to-br from-primary/20 to-primary/5
                border border-primary/20
                transition-transform duration-300
                ${isHovered ? 'scale-110' : ''}
              `}
            >
              <Bot className="w-6 h-6 text-primary" />
            </div>

            {/* Name and Badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg leading-tight truncate">
                  {agent.name}
                </h3>
                <Badge
                  variant={agent.mode === 'subagent' ? 'secondary' : 'default'}
                  className={`
                    text-[10px] px-2 py-0 h-5
                    transition-all duration-300
                    ${agent.mode === 'subagent'
                      ? 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                      : 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                    }
                    ${isHovered ? 'scale-105' : ''}
                  `}
                >
                  {agent.mode}
                </Badge>
              </div>

              {/* Description with fade effect */}
              <div className="relative">
                <p
                  className={`
                    text-sm text-muted-foreground
                    transition-all duration-300
                    ${isHovered ? 'line-clamp-none' : 'line-clamp-2'}
                  `}
                >
                  {agent.description}
                </p>
                {!isHovered && agent.description.length > 80 && (
                  <div className="absolute bottom-0 right-0 w-12 h-5 bg-gradient-to-l from-card/70 to-transparent" />
                )}
              </div>
            </div>
          </div>

          {/* Model Info Section */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg
                bg-muted/50 border border-border/50
                transition-all duration-300
                ${isHovered ? 'bg-muted border-border' : ''}
              `}
            >
              <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium font-mono text-foreground">
                {agent.model}
              </span>
            </div>

            {/* Temperature Indicator */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg
                    bg-muted/50 border border-border/50
                    transition-all duration-300
                    ${isHovered ? 'bg-muted border-border' : ''}
                  `}
                >
                  <Thermometer
                    className={`w-3.5 h-3.5 ${getTemperatureColor(agent.temperature).replace('bg-', 'text-')}`}
                  />
                  <div className="flex items-center gap-1.5">
                    {/* Temperature gauge */}
                    <div className="w-8 h-1.5 rounded-full bg-muted-foreground/20 overflow-hidden">
                      <div
                        className={`
                          h-full rounded-full transition-all duration-500
                          ${getTemperatureColor(agent.temperature)}
                        `}
                        style={{ width: `${agent.temperature * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {agent.temperature}
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">
                  Temperature: {getTemperatureLabel(agent.temperature)}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Tools Section */}
          <div className="space-y-2">
            {fileTools.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-12">
                  Files
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {fileTools.map(({ key, icon: Icon, label }) => (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            flex items-center gap-1.5 px-2 py-1 rounded-md
                            bg-primary/5 border border-primary/10
                            text-xs text-primary
                            transition-all duration-200
                            hover:bg-primary/10 hover:border-primary/20
                            ${isHovered ? 'scale-105' : ''}
                          `}
                        >
                          <Icon className="w-3 h-3" />
                          <span className="capitalize">{key}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">{label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}

            {systemTools.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-12">
                  System
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {systemTools.map(({ key, icon: Icon, label }) => (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            flex items-center gap-1.5 px-2 py-1 rounded-md
                            bg-secondary/50 border border-border/50
                            text-xs text-secondary-foreground
                            transition-all duration-200
                            hover:bg-secondary hover:border-border
                            ${isHovered ? 'scale-105' : ''}
                          `}
                        >
                          <Icon className="w-3 h-3" />
                          <span className="capitalize">{key}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">{label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hover hint */}
          <div
            className={`
              absolute bottom-3 right-3
              flex items-center gap-1
              text-[10px] text-muted-foreground/60
              transition-all duration-300
              ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            `}
          >
            <Sparkles className="w-3 h-3" />
            <span>Click to edit</span>
          </div>
        </div>
      </button>
    </TooltipProvider>
  )
}

export default AgentCard
