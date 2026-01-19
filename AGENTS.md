# AGENTS.md - Coding Agent Guidelines

This document provides essential information for AI coding agents working in this repository.

## Project Overview

- **Project**: kanban-code - A Kanban board application
- **Type**: React 19 + TypeScript + Vite frontend
- **Package Manager**: Bun (see `bun.lock`)
- **Module System**: ESM (`"type": "module"`)

## Build/Lint/Test Commands

### Development

```bash
bun run dev          # Start development server with HMR
bun run preview      # Preview production build locally
```

### Build

```bash
bun run build        # TypeScript check + Vite production build
```

### Linting

```bash
bun run lint         # Run ESLint on the codebase
```

### Type Checking

```bash
bunx tsc -b          # Run TypeScript compiler (build mode)
bunx tsc --noEmit    # Type check without emitting files
```

### Testing

No test framework is currently configured. When adding tests:

```bash
# Recommended: Add Vitest (Vite-native test runner)
bun add -d vitest @testing-library/react @testing-library/jest-dom

# Running tests (after setup):
bun run test              # Run all tests
bun run test <filename>   # Run single test file
bunx vitest <filename>    # Run single test directly
bunx vitest --run         # Run once without watch
```

## Project Structure

```
src/
├── main.tsx          # App entry point, renders to DOM
├── App.tsx           # Root React component
├── App.css           # Component-specific styles
├── index.css         # Global styles
└── assets/           # Static assets (images, SVGs)
public/               # Public static files
```

## TypeScript Configuration

### Compiler Options (tsconfig.app.json)

- **Target**: ES2022
- **Module**: ESNext with bundler resolution
- **Strict Mode**: Enabled with additional checks:
  - `noUnusedLocals`: true
  - `noUnusedParameters`: true
  - `noFallthroughCasesInSwitch`: true
  - `noUncheckedSideEffectImports`: true
- **JSX**: react-jsx (automatic runtime)

### Important Flags

- `verbatimModuleSyntax`: Use `import type` for type-only imports
- `erasableSyntaxOnly`: Only use erasable TypeScript syntax

## Code Style Guidelines

### Imports

Order imports in this sequence (separated by blank lines when appropriate):

1. React and React-related packages
2. Third-party libraries
3. Local components/modules
4. Assets and styles

```tsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
```

**Type Imports**: Use `import type` for type-only imports:

```tsx
import type { ReactNode, MouseEvent } from 'react'
```

### Component Style

- Use **function declarations** for components (not arrow functions)
- Use **default exports** for components
- Use **fragments** (`<>...</>`) when no wrapper element is needed

```tsx
function MyComponent() {
  const [state, setState] = useState(initialValue)

  return (
    <>
      <div>Content</div>
    </>
  )
}

export default MyComponent
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserCard`, `TaskList` |
| Files (components) | PascalCase.tsx | `UserCard.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth`, `useTasks` |
| Variables/Functions | camelCase | `handleClick`, `userData` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Types/Interfaces | PascalCase | `UserData`, `TaskProps` |
| CSS classes | kebab-case | `card-header`, `read-the-docs` |

### Event Handlers

Use arrow functions inline for simple handlers or define handlers with `handle` prefix:

```tsx
<button onClick={() => setCount((count) => count + 1)}>
  Increment
</button>

// Or for complex logic:
function handleSubmit(e: FormEvent) {
  e.preventDefault()
  // ...
}
```

### Styling

- Use **CSS files** for styling (not CSS-in-JS)
- Component-specific styles: `ComponentName.css`
- Global styles: `index.css`
- CSS variables defined in `:root`
- Support both light and dark color schemes via `prefers-color-scheme`

### Error Handling

- Use TypeScript's strict null checks
- Handle async errors with try/catch or `.catch()`
- Validate external data at runtime (consider Zod for schemas)

## React Compiler

This project uses **React Compiler** (babel-plugin-react-compiler) which:

- Automatically memoizes components and values
- Eliminates need for manual `useMemo`, `useCallback`, `React.memo`
- May impact dev/build performance

**Do not add** manual memoization unless profiling shows specific need.

## ESLint Configuration

ESLint is configured with:

- `@eslint/js` recommended rules
- `typescript-eslint` recommended rules  
- `eslint-plugin-react-hooks` for hooks rules
- `eslint-plugin-react-refresh` for HMR compatibility

The `dist/` directory is ignored.

## Common Patterns

### State Management

Use React's built-in state for local state:

```tsx
const [items, setItems] = useState<Item[]>([])
```

### Props Typing

```tsx
interface CardProps {
  title: string
  children: ReactNode
  onClick?: () => void
}

function Card({ title, children, onClick }: CardProps) {
  return (...)
}
```

### Asset Imports

```tsx
import reactLogo from './assets/react.svg'  // Local asset
import viteLogo from '/vite.svg'             // Public folder
```

## Before Committing

Always run these commands before committing:

```bash
bun run lint && bun run build
```

This ensures:
1. No ESLint errors
2. TypeScript compiles without errors
3. Production build succeeds
