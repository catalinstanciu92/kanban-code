import { Shield, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AgentsInitOverlayProps {
  path: string
  onInitialize: () => Promise<void>
  isLoading?: boolean
}

function AgentsInitOverlay({ path, onInitialize, isLoading = false }: AgentsInitOverlayProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full text-center space-y-6 p-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
          <FolderPlus className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Initialize Agents Folder</h2>
          <p className="text-muted-foreground text-sm">
            The agents folder doesn't exist yet. Create it to start managing AI agents.
          </p>
        </div>

        <div className="bg-muted rounded-lg p-4 text-left">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Security Notice</p>
              <p className="text-muted-foreground">
                This will create a folder at <code className="bg-background px-1.5 py-0.5 rounded text-xs">{path}</code>.
                Agent files contain configuration and instructions for AI assistants.
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={onInitialize}
          disabled={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>Initializing...</>
          ) : (
            <>
              <FolderPlus className="w-4 h-4 mr-2" />
              Create Agents Folder
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default AgentsInitOverlay
