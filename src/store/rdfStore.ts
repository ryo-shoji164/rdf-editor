import { create } from 'zustand'
import * as N3 from 'n3'
import { parseTurtle, parseNTriples, parseJsonLd } from '../lib/rdf/parser'
import type { ParseError } from '../lib/rdf/parser'
import { serializeTurtle, serializeNTriples, downloadText } from '../lib/rdf/serializer'
import type { RdfFormat } from '../types/rdf'
import type * as JsonLdModule from 'jsonld'
import { useValidationStore } from './validationStore'

export interface RdfState {
  // RDF core data
  turtleText: string
  store: N3.Store
  prefixes: Record<string, string>
  /** @deprecated Use `parseErrors` for structured error information. */
  parseError: string | null
  /** Structured list of parse errors with location information. */
  parseErrors: ParseError[]
  isParsing: boolean

  // Actions
  setTurtleText: (text: string) => void
  reparseNow: () => Promise<void>
  importFile: (content: string, format: RdfFormat) => Promise<void>
  exportAs: (format: RdfFormat) => Promise<void>
  clearAll: () => void

  /**
   * Re-serialize the current N3.Store back to Turtle and update turtleText.
   * Used by storeWriter after direct Store mutations (graph/table editing).
   */
  applyStoreChange: () => Promise<void>
}

export type { ParseError }

// Debounce timer for auto-parse
let parseTimer: ReturnType<typeof setTimeout> | null = null

async function applyParseResult(
  text: string,
  set: (partial: Partial<RdfState>) => void
): Promise<void> {
  set({ isParsing: true })
  const result = await parseTurtle(text)
  set({
    store: result.store,
    prefixes: result.prefixes,
    parseError: result.error ?? null,
    parseErrors: result.errors ?? [],
    isParsing: false,
  })
  // Trigger SHACL validation after a successful parse
  if (!result.error) {
    useValidationStore.getState().runValidation(result.store, text)
  }
}

export const useRdfStore = create<RdfState>((set, get) => ({
  turtleText: '',
  store: new N3.Store(),
  prefixes: {},
  parseError: null,
  parseErrors: [],
  isParsing: false,

  setTurtleText: (text) => {
    set({ turtleText: text, parseError: null, parseErrors: [] })
    // Debounce parsing: 400ms after last keystroke
    if (parseTimer) clearTimeout(parseTimer)
    parseTimer = setTimeout(() => applyParseResult(text, set), 400)
  },

  reparseNow: async () => {
    if (parseTimer) {
      clearTimeout(parseTimer)
      parseTimer = null
    }
    await applyParseResult(get().turtleText, set)
  },

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
      set({ parseError: parseResult.error, parseErrors: parseResult.errors ?? [] })
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
    const { store, turtleText } = get()
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
        const doc = await (jsonld.default as typeof JsonLdModule).fromRDF(nt, {
          format: 'application/n-quads',
        })
        downloadText(JSON.stringify(doc, null, 2), 'model.jsonld', 'application/ld+json')
      } catch (err) {
        console.error('JSON-LD export failed', err)
      }
    }
  },

  clearAll: () => {
    set({ turtleText: '', store: new N3.Store(), prefixes: {}, parseError: null, parseErrors: [] })
  },

  applyStoreChange: async () => {
    const { store, prefixes } = get()
    const turtle = await serializeTurtle(store, prefixes)
    set({ turtleText: turtle, parseError: null, parseErrors: [] })
    // Reparse the newly generated Turtle to replace the store with a new instance,
    // which triggers React's state change detection and invalidates memoized lists.
    await get().reparseNow()
  },
}))
