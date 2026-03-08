# rdf-editor

A browser-based RDF data editor with syntax highlighting, graph visualization, and triple table view.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI Pipeline](https://github.com/ryo-shoji164/rdf-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/ryo-shoji164/rdf-editor/actions/workflows/ci.yml)

---

## Screenshot

> _Screenshot coming soon — replace this placeholder with an actual screenshot or GIF._

![rdf-editor screenshot placeholder](https://via.placeholder.com/800x450?text=rdf-editor+screenshot)

---

## Features

- **Turtle / N-Triples / JSON-LD editing** with syntax highlighting powered by Monaco Editor
- **Graph visualization** — interactive node-link diagram via Cytoscape.js
- **Triple table view** — browse and inspect all triples in a sortable table
- **SAMM support** — built-in vocabulary and templates for the Semantic Aspect Meta Model

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
| `npm run lint` | Check code with ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format all source files with Prettier |
| `npm run format:check` | Check formatting without writing changes |
| `npm run typecheck` | Run TypeScript type check without emitting |
| `npm run audit` | Run npm security audit (high severity and above) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5 (strict mode) |
| UI Framework | React 18 |
| Build Tool | Vite 5 |
| Testing | Vitest + Testing Library + Playwright |
| RDF Parsing | N3.js |
| Graph Visualization | Cytoscape.js |
| Linting / Formatting | ESLint 9 + Prettier 3 |

---

## Contributing

Contribution guidelines are coming soon. See [CONTRIBUTING.md](CONTRIBUTING.md) once it is published.

In the meantime, please open an issue to discuss your proposed change before submitting a pull request.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
