# RDF Editor — AI Agent Coding Guidelines

This document defines the conventions and workflow for AI coding agents working on this repository.
Read this file fully before making any changes.

---

## Tech Stack

| Layer | Library / Tool | Version |
|---|---|---|
| UI framework | React | 18 |
| Language | TypeScript | 5 (strict) |
| Build tool | Vite | 7 |
| State management | Zustand | 5 |
| RDF parsing/serializing | N3.js | 2 |
| JSON-LD processing | jsonld | 8 |
| Code editor | Monaco Editor (@monaco-editor/react) | 0.45 |
| Graph visualization | Cytoscape.js + cytoscape-cose-bilkent | 3 |
| Icons | lucide-react | 0.577 |
| Styling | Tailwind CSS | 3 |
| Internationalization | i18next + i18next-browser-languagedetector | 25 |
| Unit test framework | Vitest + Testing Library | 4 |
| E2E test framework | Playwright | 1.58 |
| Linter | ESLint 9 (flat config) | 9 |
| Formatter | Prettier | 3 |

---

## Environment & Configuration

- **Node.js**: Version 20 (pinned in `.nvmrc`).
- **Prettier**: `semi: false`, `singleQuote: true`, `tabWidth: 2`, `printWidth: 100`, `trailingComma: es5`. Markdown files (`*.md`) are excluded via `.prettierignore`.
- **Tailwind theme**: Catppuccin-inspired dark palette with custom `surface`, `accent`, and `text` color scales. Font: JetBrains Mono. See `tailwind.config.js`.
- **Vite base path**: Automatically set to `/rdf-editor/` when `GITHUB_ACTIONS` env is detected, for GitHub Pages deployment.
- **Dependabot**: Configured for weekly npm and GitHub Actions updates (Monday 09:00 JST, max 5 open PRs).

---

## Directory Structure

```
src/
├── components/              # React components (UI only, no business logic)
│   ├── editor/              # Monaco editor wrapper (TurtleEditor.tsx)
│   ├── graph/               # Cytoscape graph view + editing dialogs
│   │   ├── RdfGraph.tsx
│   │   ├── AddNodeDialog.tsx
│   │   ├── AddEdgeDialog.tsx
│   │   ├── GraphContextMenu.tsx
│   │   ├── GraphLegend.tsx
│   │   └── graphUtils.ts
│   ├── layout/              # App shell (AppLayout, StatusBar, TemplateMenu)
│   ├── samm/                # SAMM-domain-specific panels & forms
│   └── table/               # Triple table view
├── lib/                     # Pure business logic (no React)
│   ├── domains/             # Domain plugin registry
│   │   ├── registry.ts
│   │   └── freePlugin.ts
│   ├── editor/              # Monaco editor customization
│   │   ├── languageSetup.ts
│   │   ├── completionProvider.ts
│   │   └── diagnosticsProvider.ts
│   ├── i18n/                # Internationalization
│   │   ├── i18n.ts          # i18next configuration
│   │   └── locales/         # en.json, ja.json
│   ├── rdf/                 # RDF parsing, serializing, store utilities
│   └── samm/                # SAMM vocabulary, templates, reader, plugin
├── store/                   # Zustand stores
│   ├── rdfStore.ts          # RDF data (turtleText, N3.Store, prefixes, parseError)
│   ├── uiStore.ts           # UI state (activeView, selectedNode)
│   ├── domainStore.ts       # Domain plugin registry state
│   ├── validationStore.ts   # SHACL validation results (future)
│   ├── initDomains.ts       # Domain initialization at startup
│   └── appStore.ts          # ⚠ Legacy monolithic store — do not extend
├── types/                   # Shared TypeScript type definitions
│   ├── domain.ts            # DomainPlugin, DomainTemplate, VocabularyItem
│   └── rdf.ts               # RdfFormat, Triple, SAMM model types
└── test/                    # Test setup files

tests/
└── e2e/                     # Playwright E2E tests
```

---

## Code Style

All code is enforced by **ESLint** and **Prettier**. Run before committing:

```bash
npm run lint            # ESLint check
npm run lint:fix        # ESLint auto-fix
npm run format          # Prettier format all src files
npm run format:check    # Prettier check (CI-friendly)
npm run typecheck       # TypeScript type check (tsc --noEmit)
npm run test            # Vitest run (unit tests)
npm run test:watch      # Vitest watch mode
npm run test:coverage   # Vitest with coverage
npm run e2e             # Playwright E2E tests (Chromium, Firefox, WebKit)
npm run audit           # npm audit --audit-level=high
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
- `rdfStore.setTurtleText()` uses a **400ms debounce** before triggering a re-parse. Call `reparseNow()` to parse immediately (e.g., after file import).

---

## Component Conventions

- One component per file.
- Default export the component; named-export other items from the same file (types, constants).
- Keep components focused: extract sub-components if a file exceeds ~200 lines.
- Use **Tailwind CSS** for all styling. Avoid inline `style={{}}` except for dynamic values not achievable with Tailwind.
- Do not import CSS files inside component files; global styles live in `src/index.css`.

---

## Internationalization (i18n)

- Uses **i18next** with browser language detection (`i18next-browser-languagedetector`).
- Configuration: `src/lib/i18n/i18n.ts`.
- Locale files: `src/lib/i18n/locales/en.json` (English), `src/lib/i18n/locales/ja.json` (Japanese).
- All user-facing strings in components should use the `useTranslation` hook — do not hardcode English text.
- When adding new UI text, add keys to **both** `en.json` and `ja.json`.

---

## Monaco Editor Customization

Custom Turtle language support is implemented in `src/lib/editor/`:

- **`languageSetup.ts`** — Registers the Turtle language with Monaco (tokenization, brackets, comments).
- **`completionProvider.ts`** — Provides auto-completion for prefixed names, IRIs, and domain vocabulary items.
- **`diagnosticsProvider.ts`** — Feeds parse errors from `rdfStore` into Monaco as editor markers.

These are pure library functions (no React). The component in `src/components/editor/` consumes them.

---

## Testing

- **Unit tests** live in `__tests__/` subdirectories next to source (preferred) or co-located with the module (e.g., `parser.test.ts` next to `parser.ts`). Prefer `__tests__/` for new tests.
- Test files are named `<module>.test.ts` or `<module>.test.tsx`.
- Run unit tests: `npm run test` (or `npm run test:watch` for development).
- **E2E tests** live in `tests/e2e/` at the project root and run via Playwright across Chromium, Firefox, and WebKit: `npm run e2e`.
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

Register plugins via the domain registry at `src/lib/domains/registry.ts`. The registry is initialized at startup in `src/store/initDomains.ts`, which registers the built-in `freePlugin` and `sammPlugin`. Domain state lives in `src/store/domainStore.ts`. Do not hard-code domain logic in `AppLayout` or other UI components.

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

## Security Rules

AI agents **must** follow these rules when writing code for this repository. Violations introduce security vulnerabilities into a public web application.

### A. Secrets & Credentials

- Never hardcode API keys, tokens, passwords, or secrets in any source file.
- API keys for future features (LLM API for I-1, GitHub PAT for E-2) must be stored in `localStorage` only after an explicit user consent UI — never in source code or `.env` files committed to the repo.
- `.env` files are gitignored and must never be committed.
- Never log secrets to the console, even in error handlers:
  ```ts
  // BAD
  console.error('Request failed', { token: userToken })

  // GOOD
  console.error('Request failed — check your token in settings')
  ```

### B. XSS Prevention

- Never use `dangerouslySetInnerHTML` with user-provided content (RDF labels, IRIs, literal values).
- Graph node labels (Cytoscape), table cell values, and status bar text must all be set as text content, not `innerHTML`.
- When implementing graph node tooltips or custom HTML labels in Cytoscape, use text escaping — never inject raw label strings as HTML.
- Monaco Editor content is sandboxed — do not inject user RDF content into the DOM outside of Monaco.

### C. URL Validation for External Fetch

- When implementing SPARQL endpoint fetch (E-3) and Gist integration (E-2), validate URLs before fetching.
- Allow only `https://` scheme — reject `http://`, `javascript:`, `data:`, `file:`, and other schemes.
- Show a clear error message to the user for invalid schemes rather than silently ignoring the input.
- Do not follow open redirects — validate the final URL, not just the initial one.
- Use this pattern as the validation reference:
  ```ts
  function isSafeUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'https:'
    } catch {
      return false
    }
  }
  ```

### D. Dependency Security

- Run `npm run audit` before adding new dependencies.
- Do not add packages with known high or critical vulnerabilities.
- Prefer packages that are actively maintained (recent commits, not archived).
- Always commit `package-lock.json` — never delete or gitignore it.
- Do not install packages at runtime (no `eval`-based dynamic loading).

### E. No Code Execution of User Input

- Never use `eval()`, `new Function()`, or `setTimeout(string)` with user-provided content.
- The Monaco Editor displays code but must never execute it.
- Dynamic `import()` must only use static string paths — never user-provided paths.

### F. Token & Credential Storage (for future E-2, I-1 features)

- User-provided API keys (GitHub PAT, OpenAI key) must only be stored in `localStorage`.
- Always show a clear warning in the UI: "This token is stored in your browser's localStorage. Do not use this on shared computers."
- Provide a "Clear token" button that calls `localStorage.removeItem(key)`.
- Never include tokens in URLs, URL hash, or shareable links — the E-1 shareable URL feature must explicitly exclude tokens from the serialized state.

### G. GitHub Actions Security

- All workflow files must declare `permissions:` explicitly at the job level with minimal required permissions.
- Use `permissions: read-all` as a default, and only grant `write` permissions where strictly necessary.
- Pin third-party GitHub Actions to a full commit SHA rather than a mutable tag:
  ```yaml
  # BAD
  - uses: actions/checkout@v4

  # GOOD
  - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af68 # v4.2.2
  ```
- Never print `GITHUB_TOKEN` or any secret to logs.
- Do not use the `pull_request_target` trigger with code checkout from the PR branch (risk of privilege escalation).

### H. Content Security Policy

- When adding a `<meta http-equiv="Content-Security-Policy">` tag to `index.html`, restrict `script-src` to `'self'` and specific trusted CDNs only.
- Do not use `'unsafe-eval'` or `'unsafe-inline'` in CSP.
- Monaco Editor uses web workers — document the correct worker-compatible CSP before implementing it.

---


## What NOT to do

- Do not add `console.log` for debugging — use proper error handling or `console.warn`/`console.error`.
- Do not bypass the pre-commit hook (`--no-verify`).
- Do not store derived state in Zustand — compute it in selectors or `useMemo`.
- Do not add new dependencies without justification in the PR description.
- Do not edit `node_modules/` or generated files in `dist/`.
- Do not extend `appStore.ts` — it is a legacy monolithic store. Use the split stores (`rdfStore`, `uiStore`, `domainStore`).
