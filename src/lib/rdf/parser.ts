import * as N3 from 'n3'
import type { RdfFormat } from '../../types/rdf'
import type * as JsonLdModule from 'jsonld'

export interface ParseResult {
  store: N3.Store
  prefixes: Record<string, string>
  error?: string
}

/**
 * Parse Turtle text into an N3.Store.
 */
export function parseTurtle(text: string): Promise<ParseResult> {
  return new Promise((resolve) => {
    const store = new N3.Store()
    const parser = new N3.Parser({ format: 'Turtle' })
    let prefixes: Record<string, string> = {}

    parser.parse(text, (error, quad, prefixMap) => {
      if (error) {
        resolve({ store, prefixes, error: error.message })
        return
      }
      if (quad) {
        store.add(quad)
      } else {
        // prefixMap is available when quad is null (parsing done)
        if (prefixMap) {
          prefixes = Object.fromEntries(
            Object.entries(prefixMap as Record<string, N3.NamedNode>).map(([k, v]) => [
              k,
              typeof v === 'string' ? v : v.value,
            ])
          )
        }
        resolve({ store, prefixes })
      }
    })
  })
}

/**
 * Parse N-Triples or N-Quads text into an N3.Store.
 */
export function parseNTriples(
  text: string,
  format: 'N-Triples' | 'N-Quads' = 'N-Triples'
): Promise<ParseResult> {
  return new Promise((resolve) => {
    const store = new N3.Store()
    const parser = new N3.Parser({ format })

    parser.parse(text, (error, quad) => {
      if (error) {
        resolve({ store, prefixes: {}, error: error.message })
        return
      }
      if (quad) {
        store.add(quad)
      } else {
        resolve({ store, prefixes: {} })
      }
    })
  })
}

/**
 * Parse JSON-LD by converting it to N-Triples via the jsonld library,
 * then parsing the result with N3.
 */
export async function parseJsonLd(text: string): Promise<ParseResult> {
  try {
    // Dynamic import to keep bundle lean when not needed
    const jsonld = await import('jsonld')
    const doc = JSON.parse(text)
    const nquads: string = (await (jsonld.default as typeof JsonLdModule).toRDF(doc, {
      format: 'application/n-quads',
    })) as string
    return parseNTriples(nquads, 'N-Quads')
  } catch (err) {
    return { store: new N3.Store(), prefixes: {}, error: String(err) }
  }
}

/**
 * Auto-detect format and parse text.
 */
export async function parseAuto(text: string, hint?: RdfFormat): Promise<ParseResult> {
  const trimmed = text.trimStart()

  if (hint === 'jsonld' || (!hint && (trimmed.startsWith('{') || trimmed.startsWith('[')))) {
    return parseJsonLd(text)
  }
  if (hint === 'n-triples' || hint === 'n-quads') {
    return parseNTriples(text, hint === 'n-quads' ? 'N-Quads' : 'N-Triples')
  }
  // Default: Turtle
  return parseTurtle(text)
}
