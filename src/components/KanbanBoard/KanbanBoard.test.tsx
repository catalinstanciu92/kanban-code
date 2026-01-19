import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KanbanBoard } from './KanbanBoard'

describe('KanbanBoard', () => {
  const mockColumns = [
    { id: 'todo', name: 'Todo', color: '#6366f1', file: 'todo.csv', order: 1 },
    { id: 'done', name: 'Done', color: '#10b981', file: 'done.csv', order: 2 },
  ]

  const mockTasks = {
    todo: [
      { id: '1', title: 'Task 1', description: '', priority: 'medium' as const, createdAt: '', updatedAt: '', tags: [] },
    ],
    done: [],
  }

  it('should render all columns', () => {
    render(
      <KanbanBoard
        columns={mockColumns}
        tasks={mockTasks}
        onTaskMove={vi.fn()}
        onTaskCreate={vi.fn()}
        onTaskDelete={vi.fn()}
      />
    )
    
    expect(screen.getByText('Todo')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('should render tasks in correct columns', () => {
    render(
      <KanbanBoard
        columns={mockColumns}
        tasks={mockTasks}
        onTaskMove={vi.fn()}
        onTaskCreate={vi.fn()}
        onTaskDelete={vi.fn()}
      />
    )
    
    expect(screen.getByText('Task 1')).toBeInTheDocument()
  })

  it('should show connection status indicator', () => {
    render(
      <KanbanBoard
        columns={mockColumns}
        tasks={mockTasks}
        onTaskMove={vi.fn()}
        onTaskCreate={vi.fn()}
        onTaskDelete={vi.fn()}
        isConnected={true}
      />
    )
    
    expect(screen.getByTestId('connection-status')).toHaveClass('connected')
  })
})
