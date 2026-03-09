# rdf-editor

A browser-based RDF data editor with syntax highlighting, graph visualization, table view, and real-time validation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI Pipeline](https://github.com/ryo-shoji164/rdf-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/ryo-shoji164/rdf-editor/actions/workflows/ci.yml)

---

## Screenshot

> _Screenshot coming soon — replace this placeholder with an actual screenshot or GIF._

![rdf-editor screenshot placeholder](https://via.placeholder.com/800x450?text=rdf-editor+screenshot)

---

## Features

- **Advanced Code Editor**: Turtle, N-Triples, and JSON-LD support with syntax highlighting (Monaco Editor) and structured parse error reporting.
- **Interactive Graph Visualization**: Node-link diagram (Cytoscape.js) with dynamic layout, toolbar, and inline node/edge editing.
- **Triple Table View**: Browse, inspect, and inline edit all triples in a sortable data grid.
- **Domain & Validation Support**: Built-in vocabularies, intelligent templates, and real-time SHACL validation for the **Semantic Aspect Meta Model (SAMM)** and **Schema.org**.
- **Internationalization (i18n)**: Full UI localization supporting **English** and **Japanese**.
- **Interactive Onboarding**: A step-by-step guided tutorial to help new users learn the editor's features.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Available npm Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run test` | Run unit tests with Vitest |
| `npm run e2e` | Run Playwright E2E tests (Chromium, Firefox, WebKit) |
| `npm run lint` | Check code with ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format all source files with Prettier |
| `npm run typecheck` | Run TypeScript type check without emitting |
| `npm run audit` | Run npm security audit (high severity and above) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5 (strict mode) |
| UI Framework | React 18 |
| Build Tool | Vite 7 |
| State Management | Zustand 5 |
| RDF Parsing | N3.js 2, jsonld 8 |
| Editor Platform | Monaco Editor 0.45 |
| Graph Visualization | Cytoscape.js 3 |
| Styling | Tailwind CSS 3 |
| Internationalization| i18next 25 |
| Testing | Vitest 4 + Playwright 1.58 |
| Linting / Formatting | ESLint 9 + Prettier 3 |

---

## Contributing

Contribution guidelines are defined in [CLAUDE.md](CLAUDE.md). Please open an issue to discuss your proposed change before submitting a pull request.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
