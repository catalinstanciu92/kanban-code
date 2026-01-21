# AGENTS.md - Coding Agent Guidelines

This document provides essential information for AI coding agents working in this repository.

## Project Overview

- **Project**: kanban-code - A full-stack Kanban board application
- **Stack**: React 19 + TypeScript + Vite (Frontend), Bun (Backend/Server)
- **Package Manager**: Bun (use `bun install`, `bun add`, etc.)
- **Module System**: ESM (`"type": "module"`)
- **Key Path Alias**: `@/*` points to `src/`

## Build/Lint/Test Commands

### Development

```bash
bun run dev          # Start frontend (Vite)
bun run dev:server   # Start backend (Bun)
bun run dev:all      # Start both frontend and backend concurrently
```

### Build & Lint

```bash
bun run lint         # Run ESLint
bun run build        # Type check + Vite production build
bun run build:exec   # Build both and compile backend to binary
```

### Testing

The project uses **Vitest** for unit/component tests and **Playwright** for E2E tests.

```bash
# Unit/Component Tests (Vitest)
bun run test              # Run all unit tests
bun run test <path>       # Run single test file (e.g., bun run test src/components/Button.test.tsx)
bun run test:run          # Run tests once (CI mode)

# E2E Tests (Playwright)
bun run test:e2e          # Run all E2E tests
bunx playwright test <path> # Run single E2E file (e.g., bunx playwright test tests/kanban.spec.ts)
```

## Project Structure

```
server/               # Bun backend (CSV storage, WebSockets)
src/
├── components/       # React components (includes shadcn/ui)
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and shared logic
├── types/            # TypeScript type definitions
└── test/             # Test setup and utilities
tests/                # Playwright E2E tests
```

## Code Style Guidelines

### Imports

Order: React, Third-party, Local (`@/`), Styles. Use `import type` for types.

```tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Task } from '@/types'

import './App.css'
```

### Component Style

- Use **function declarations** (not arrow functions) for components.
- Use **default exports** for components.
- Use **Tailwind CSS** for styling (utility classes).
- Favor **composition** and **fragments** (`<>...</>`).

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components / Files | PascalCase | `KanbanBoard.tsx` |
| Hooks | camelCase (`use` prefix) | `useTasks.ts` |
| Variables / Functions | camelCase | `handleTaskMove` |
| Constants | UPPER_SNAKE_CASE | `DB_PATH` |
| Types / Interfaces | PascalCase | `TaskData` |

### Error Handling

- Use TypeScript's strict null checks.
- Handle async errors with `try/catch`.
- Provide user-friendly error states in the UI.

## React & State

- **React Compiler**: Enabled. Avoid manual `useMemo`/`useCallback` unless necessary.
- **State**: Use local `useState` for UI state, custom hooks for business logic.
- **Data Flow**: One-way (props down, events up).

## Before Committing

Always run `bun run lint && bun run build` to ensure no regressions.
