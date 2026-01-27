import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AgentCard from '@/components/AgentCard'
import AgentEditDialog from '@/components/AgentEditDialog'
import AgentsInitOverlay from './AgentsInitOverlay'
import { useAgents } from '@/hooks/useAgents'
import type { Agent, CreateAgentInput, UpdateAgentInput } from '@/types'

function AgentsPage() {
  const {
    agents,
    isLoading,
    error,
    isInitialized,
    initializePath,
    initialize,
    addAgent,
    updateAgent,
    deleteAgent,
    refresh,
  } = useAgents()

  const [searchQuery, setSearchQuery] = useState('')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | undefined>()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isInitialized) {
      refresh()
    } else {
      refresh()
    }
  }, [isInitialized, refresh])

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateClick = () => {
    setSelectedAgent(undefined)
    setEditDialogOpen(true)
  }

  const handleEditClick = (agent: Agent) => {
    setSelectedAgent(agent)
    setEditDialogOpen(true)
  }

  const handleSave = async (input: CreateAgentInput | UpdateAgentInput) => {
    setIsSaving(true)
    try {
      if (selectedAgent) {
        await updateAgent(selectedAgent.name, input)
      } else {
        await addAgent(input as CreateAgentInput)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (selectedAgent) {
      await deleteAgent(selectedAgent.name)
    }
  }

  if (!isInitialized) {
    return (
      <AgentsInitOverlay
        path={initializePath}
        onInitialize={initialize}
        isLoading={isLoading}
      />
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <span className="text-red-400 text-xl">!</span>
        </div>
        <h2 className="text-lg font-semibold mb-2">Failed to load agents</h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={() => refresh()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Agents</h1>
          <p className="text-muted-foreground">Manage your AI agents</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          New Agent
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading && agents.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? 'No agents match your search' : 'No agents yet. Create your first agent!'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.name}
              agent={agent}
              onClick={() => handleEditClick(agent)}
            />
          ))}
        </div>
      )}

      <AgentEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        agent={selectedAgent}
        onSave={handleSave}
        onDelete={selectedAgent ? handleDelete : undefined}
        isLoading={isSaving}
      />
    </div>
  )
}

export default AgentsPage
