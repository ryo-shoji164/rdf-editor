import { create } from 'zustand'
import * as N3 from 'n3'
import { parseTurtle, parseNTriples, parseJsonLd } from '../lib/rdf/parser'
import { serializeTurtle, serializeNTriples, downloadText } from '../lib/rdf/serializer'
import { FOAF_EXAMPLE, SAMM_EXAMPLE } from '../lib/samm/templates'
import type { RdfFormat } from '../types/rdf'

export type ActiveView = 'editor' | 'graph' | 'table' | 'split'
export type AppMode = 'free' | 'samm'

interface AppState {
  // RDF core
  turtleText: string
  store: N3.Store
  prefixes: Record<string, string>
  parseError: string | null
  isParsing: boolean

  // UI state
  activeView: ActiveView
  mode: AppMode
  selectedNode: string | null

  // Actions
  setTurtleText: (text: string) => void
  reparseNow: () => Promise<void>
  setActiveView: (view: ActiveView) => void
  setMode: (mode: AppMode) => void
  setSelectedNode: (iri: string | null) => void
  importFile: (content: string, format: RdfFormat) => Promise<void>
  exportAs: (format: RdfFormat) => Promise<void>
  loadExample: (type: 'foaf' | 'samm') => void
  clearAll: () => void
  applyStoreChange: () => Promise<void>
}

// Debounce timer for auto-parse
let parseTimer: ReturnType<typeof setTimeout> | null = null

async function applyParseResult(
  text: string,
  set: (partial: Partial<AppState>) => void
): Promise<void> {
  set({ isParsing: true })
  const result = await parseTurtle(text)
  set({
    store: result.store,
    prefixes: result.prefixes,
    parseError: result.error ?? null,
    isParsing: false,
  })
}

export const useAppStore = create<AppState>((set, get) => ({
  turtleText: FOAF_EXAMPLE,
  store: new N3.Store(),
  prefixes: {},
  parseError: null,
  isParsing: false,

  activeView: 'split',
  mode: 'free',
  selectedNode: null,

  setTurtleText: (text) => {
    set({ turtleText: text, parseError: null })
    // Debounce parsing: 400ms after last keystroke
    if (parseTimer) clearTimeout(parseTimer)
    parseTimer = setTimeout(() => applyParseResult(text, set), 400)
  },

  reparseNow: async () => {
    if (parseTimer) { clearTimeout(parseTimer); parseTimer = null }
    await applyParseResult(get().turtleText, set)
  },

  setActiveView: (view) => set({ activeView: view }),
  setMode: (mode) => set({ mode }),
  setSelectedNode: (iri) => set({ selectedNode: iri }),

  importFile: async (content, format) => {
    let parseResult
    if (format === 'turtle') {
      parseResult = await parseTurtle(content)
    } else if (format === 'n-triples' || format === 'n-quads') {
      parseResult = await parseNTriples(content, format === 'n-quads' ? 'N-Quads' : 'N-Triples')
    } else if (format === 'jsonld') {
      parseResult = await parseJsonLd(content)
    } else {
      return
    }

    if (parseResult.error) {
      set({ parseError: parseResult.error })
      return
    }

    // Convert to Turtle for the editor
    const turtle = await serializeTurtle(parseResult.store, parseResult.prefixes)
    set({
      turtleText: turtle,
      store: parseResult.store,
      prefixes: parseResult.prefixes,
      parseError: null,
    })
  },

  exportAs: async (format) => {
    const { store, prefixes, turtleText } = get()
    if (format === 'turtle') {
      downloadText(turtleText, 'model.ttl', 'text/turtle')
    } else if (format === 'n-triples') {
      const nt = await serializeNTriples(store)
      downloadText(nt, 'model.nt', 'application/n-triples')
    } else if (format === 'jsonld') {
      // Convert via N-Triples → jsonld
      try {
        const nt = await serializeNTriples(store)
        const jsonld = await import('jsonld')
        const doc = await (jsonld.default as typeof import('jsonld')).fromRDF(nt, {
          format: 'application/n-quads',
        })
        downloadText(JSON.stringify(doc, null, 2), 'model.jsonld', 'application/ld+json')
      } catch (err) {
        console.error('JSON-LD export failed', err)
      }
    }
  },

  loadExample: (type) => {
    const text = type === 'samm' ? SAMM_EXAMPLE : FOAF_EXAMPLE
    const newMode: AppMode = type === 'samm' ? 'samm' : 'free'
    set({ turtleText: text, parseError: null, mode: newMode })
    get().reparseNow()
  },

  clearAll: () => {
    set({ turtleText: '', store: new N3.Store(), prefixes: {}, parseError: null })
  },

  applyStoreChange: async () => {
    const { store, prefixes } = get()
    const turtle = await serializeTurtle(store, prefixes)
    set({ turtleText: turtle, parseError: null })
  },
}))

// Initial parse on load
setTimeout(() => {
  useAppStore.getState().reparseNow()
}, 0)
