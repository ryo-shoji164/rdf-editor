/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// When deploying to GitHub Pages (https://ryo-shoji164.github.io/rdf-editor/),
// the base path must match the repository name.
// GITHUB_ACTIONS env var is set automatically in all GitHub Actions runs.
const base = process.env.GITHUB_ACTIONS ? '/rdf-editor/' : '/'

export default defineConfig({
  base,
  plugins: [react()],
  optimizeDeps: {
    include: ['n3', 'cytoscape', 'cytoscape-cose-bilkent'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'tests/e2e/**'],
  },
})


