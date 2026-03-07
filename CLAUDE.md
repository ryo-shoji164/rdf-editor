# RDF Editor — AI Agent Coding Guidelines

This document defines the conventions and workflow for AI coding agents working on this repository.
Read this file fully before making any changes.

---

## Tech Stack

| Layer | Library / Tool | Version |
|---|---|---|
| UI framework | React | 18 |
| Language | TypeScript | 5 (strict) |
| Build tool | Vite | 5 |
| State management | Zustand | 4 |
| RDF parsing/serializing | N3.js | 1 |
| Code editor | Monaco Editor | 0.45 |
| Graph visualization | Cytoscape.js | 3 |
| Styling | Tailwind CSS | 3 |
| Test framework | Vitest + Testing Library | latest |
| Linter | ESLint 9 (flat config) | 9 |
| Formatter | Prettier | 3 |

---

## Directory Structure

```
src/
├── components/          # React components (UI only, no business logic)
│   ├── editor/          # Monaco editor wrapper
│   ├── graph/           # Cytoscape graph view
│   ├── layout/          # App shell (AppLayout, StatusBar)
│   ├── samm/            # SAMM-domain-specific panels
│   └── table/           # Triple table view
├── lib/                 # Pure business logic (no React)
│   ├── rdf/             # RDF parsing, serializing, store utilities
│   └── samm/            # SAMM vocabulary, templates, reader
├── store/               # Zustand stores
│   ├── rdfStore.ts      # RDF data (turtleText, N3.Store, prefixes, parseError)
│   ├── uiStore.ts       # UI state (activeView, selectedNode)
│   ├── domainStore.ts   # Domain plugin registry
│   └── validationStore.ts  # SHACL validation results (future)
├── types/               # Shared TypeScript type definitions
└── test/                # Test setup files
```

---

## Code Style

All code is enforced by **ESLint** and **Prettier**. Run before committing:

```bash
npm run lint        # check
npm run lint:fix    # auto-fix
npm run format      # format all src files
npm run typecheck   # TypeScript type check
```

A pre-commit hook runs `lint-staged` automatically (ESLint + Prettier on staged files).

### Key rules

1. **No `any`** — use `unknown` or proper types. `@typescript-eslint/no-explicit-any` is a warning.
2. **`import type`** — always use `import type { Foo }` for type-only imports.
3. **No unused variables** — prefix with `_` if intentionally unused (e.g., `_event`).
4. **`prefer-const`** — never use `let` when the value is never reassigned.
5. **`no-console`** — use `console.warn` / `console.error` only. Remove `console.log` before committing.

### Naming conventions

| Item | Convention | Example |
|---|---|---|
| Components | PascalCase, default export | `export default function RdfGraph()` |
| Hooks | camelCase, prefix `use` | `useRdfStore`, `useUiStore` |
| Stores | camelCase, prefix `use` | `useRdfStore` |
| Utilities / lib functions | camelCase, named export | `export function parseTurtle(...)` |
| Types / Interfaces | PascalCase | `interface ParseResult`, `type RdfFormat` |
| Constants | UPPER_SNAKE_CASE or camelCase (prefer camelCase for module-level) | `const END_OF_LINE_COLUMN = 9999` |

### Import order (enforced by ESLint)

```ts
// 1. External packages
import { useEffect } from 'react'
import * as N3 from 'n3'

// 2. Internal aliases / stores
import { useRdfStore } from '../../store/rdfStore'

// 3. Types (import type)
import type { RdfFormat } from '../../types/rdf'
```

---

## State Management

- State lives in **Zustand stores** under `src/store/`.
- Components access store state via **selector functions** to prevent unnecessary re-renders:
  ```ts
  // Good
  const turtleText = useRdfStore((s) => s.turtleText)

  // Avoid — subscribes to the entire store
  const store = useRdfStore()
  ```
- **No business logic in components.** Move parsing, serializing, and RDF manipulation to `src/lib/`.
- Side effects that span multiple stores belong in store actions, not components.

---

## Component Conventions

- One component per file.
- Default export the component; named-export other items from the same file (types, constants).
- Keep components focused: extract sub-components if a file exceeds ~200 lines.
- Use **Tailwind CSS** for all styling. Avoid inline `style={{}}` except for dynamic values not achievable with Tailwind.
- Do not import CSS files inside component files; global styles live in `src/index.css`.

---

## Testing

- Tests live next to source under `__tests__/` subdirectories (e.g., `src/lib/rdf/__tests__/`).
- Test files are named `<module>.test.ts` or `<module>.test.tsx`.
- Run tests: `npm run test:run`
- Write unit tests for all functions in `src/lib/`. Component tests are welcome but not required.

---

## Domain Plugin Architecture

New RDF domains (Schema.org, BOT, FHIR, etc.) are added as **`DomainPlugin`** objects:

```ts
// src/types/domain.ts
interface DomainPlugin {
  id: string
  label: string
  namespaces: Record<string, string>
  templates: DomainTemplate[]
  vocabularyItems?: VocabularyItem[]
  graphStyles?: CytoscapeStyleRule[]
  shaclShapes?: string
}
```

Register plugins in `src/store/initDomains.ts`. Do not hard-code domain logic in `AppLayout` or other UI components.

---

## Git Workflow

- Branch names: `feat/<issue-id>-<short-description>`, `fix/<issue-id>-<short-description>`, `refactor/<issue-id>-<short-description>`
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: add shareable URL support`
  - `fix: parse error not cleared after valid input`
  - `refactor: split appStore into domain/rdf/ui slices`
- Open a PR for every change; do not push directly to `main`.
- Reference the relevant GitHub issue in the PR body (e.g., `Closes #3`).

---

## What NOT to do

- Do not add `console.log` for debugging — use proper error handling or `console.warn`/`console.error`.
- Do not bypass the pre-commit hook (`--no-verify`).
- Do not store derived state in Zustand — compute it in selectors or `useMemo`.
- Do not add new dependencies without justification in the PR description.
- Do not edit `node_modules/` or generated files in `dist/`.
