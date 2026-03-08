import * as N3 from 'n3'
import type { RdfFormat } from '../../types/rdf'
import type * as JsonLdModule from 'jsonld'

/** Severity level for a parse error. */
export type ParseErrorSeverity = 'error' | 'warning' | 'info'

/** Structured representation of a single parse error with location information. */
export interface ParseError {
  /** Human-readable error message. */
  message: string
  /** Severity level. */
  severity: ParseErrorSeverity
  /** 1-based line number where the error occurred. */
  line: number
  /** 1-based column number where the error occurred. Defaults to 1. */
  column: number
}

export interface ParseResult {
  store: N3.Store
  prefixes: Record<string, string>
  /** @deprecated Use `errors` for structured error information. */
  error?: string
  /** Structured list of parse errors with location information. */
  errors?: ParseError[]
}

/** N3 error context shape attached to N3 parser errors. */
interface N3ErrorContext {
  line?: number
  token?: unknown
  previousToken?: unknown
}

/**
 * Extract a structured ParseError from an N3 parser error.
 * N3 errors expose `error.context.line` for the line number.
 */
function toParseError(error: Error): ParseError {
  const ctx = (error as Error & { context?: N3ErrorContext }).context
  const line = ctx?.line ?? extractLineFromMessage(error.message)
  return {
    message: error.message,
    severity: 'error',
    line,
    column: 1,
  }
}

/**
 * Fallback: extract a line number from an error message string.
 * Handles patterns like "on line 5" or "Line 5".
 */
function extractLineFromMessage(message: string): number {
  const match = message.match(/line (\d+)/i)
  return match ? parseInt(match[1], 10) : 1
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
        const parseError = toParseError(error)
        resolve({ store, prefixes, error: error.message, errors: [parseError] })
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
        resolve({ store, prefixes, errors: [] })
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
        const parseError = toParseError(error)
        resolve({ store, prefixes: {}, error: error.message, errors: [parseError] })
        return
      }
      if (quad) {
        store.add(quad)
      } else {
        resolve({ store, prefixes: {}, errors: [] })
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
    const message = String(err)
    return {
      store: new N3.Store(),
      prefixes: {},
      error: message,
      errors: [{ message, severity: 'error', line: 1, column: 1 }],
    }
  }
}

/**
 * Detect the RDF format based on file extension.
 */
export function detectFormatFromFilename(filename: string): RdfFormat {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'jsonld' || ext === 'json') return 'jsonld'
  if (ext === 'nt') return 'n-triples'
  return 'turtle'
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
