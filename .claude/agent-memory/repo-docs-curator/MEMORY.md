# RDF Editor — Repo Docs Curator Memory

## Project Identity
- **Repo**: https://github.com/ryo-shoji164/rdf-editor
- **Type**: Browser-only SPA, no backend
- **Stack**: React 18 + TypeScript 5 (strict), Vite 5, Zustand 4, Monaco Editor, Cytoscape.js, N3.js, Tailwind CSS, Vitest
- **Language**: English (documentation and code)

## Key Files
- `/Users/ryo/Documents/rdf-editor/CLAUDE.md` — AI agent guidelines (primary source of conventions)
- `/Users/ryo/Documents/rdf-editor/SECURITY.md` — Public vulnerability disclosure policy (created 2026-03-08)
- `/Users/ryo/Documents/rdf-editor/.github/workflows/security-audit.yml` — npm audit CI (created 2026-03-08)
- `/Users/ryo/Documents/rdf-editor/.gitignore` — includes env/secret patterns as of 2026-03-08

## Branch Situation
- `feat/security-rules` has a stripped-down `package.json` compared to `main` (fewer scripts, fewer devDependencies). When working on this branch, merge carefully — prefer the fuller `main`-origin scripts set.
- CLAUDE.md did not exist on `feat/security-rules` before 2026-03-08; it was introduced via this agent session.

## Documentation Style
- Active voice, no emojis
- Sections use `##` headings; subsections use `###`
- Code examples include BAD/GOOD contrast comments where applicable
- Tables used for structured reference data (tech stack, naming conventions)

## Recurring Gaps to Watch
- GitHub Actions workflows in `.github/workflows/` were using mutable version tags (e.g., `@v4`) rather than pinned commit SHAs — fixed in security-audit.yml; ci.yml still uses mutable tags as of 2026-03-08
- `package.json` on `feat/security-rules` was missing many scripts present on `main` — reconcile carefully on merges
