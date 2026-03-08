/**
 * Turtle Diagnostics Provider for Monaco Editor
 *
 * Converts parse errors (and future validation results) into Monaco markers
 * for inline error squiggles.
 *
 * Extension point: call `setDiagnostics()` with parse errors or SHACL
 * validation results to update the editor markers.
 */
import type { Monaco } from '@monaco-editor/react'
import type * as MonacoEditor from 'monaco-editor'
import type { ParseError } from '../rdf/parser'

/** Sentinel column used to highlight errors to end-of-line. */
const END_OF_LINE_COLUMN = 9999

// ─── Diagnostic item type ─────────────────────────────────────────

export type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'hint'

export interface DiagnosticItem {
  /** Error message */
  message: string
  /** Severity level */
  severity: DiagnosticSeverity
  /** Line number (1-based). Defaults to 1. */
  line?: number
  /** Start column (1-based). Defaults to 1. */
  startColumn?: number
  /** End column (1-based). Defaults to end of line. */
  endColumn?: number
  /** Source identifier (e.g. 'parser', 'shacl', 'domain') */
  source?: string
}

// ─── Internal state ───────────────────────────────────────────────

let currentDiagnostics: DiagnosticItem[] = []

// ─── Public API ───────────────────────────────────────────────────

/**
 * Create a diagnostic from a parse error string.
 * Extracts line number from common parse error patterns.
 *
 * @deprecated Prefer `fromParseErrors` which uses structured ParseError objects.
 */
export function fromParseError(error: string | null): DiagnosticItem[] {
  if (!error) return []

  // Try to extract line number from error message
  const lineMatch = error.match(/line (\d+)/i)
  const line = lineMatch ? parseInt(lineMatch[1], 10) : 1

  return [
    {
      message: error,
      severity: 'error',
      line,
      source: 'parser',
    },
  ]
}

/**
 * Convert an array of structured ParseError objects into DiagnosticItems.
 * Preserves precise line/column information from the parser.
 */
export function fromParseErrors(errors: ParseError[]): DiagnosticItem[] {
  return errors.map((e) => ({
    message: e.message,
    severity: e.severity,
    line: e.line,
    startColumn: e.column,
    source: 'parser',
  }))
}

/**
 * Set the diagnostics to display in the editor.
 * Replaces all existing diagnostics.
 */
export function setDiagnostics(diagnostics: DiagnosticItem[]): void {
  currentDiagnostics = diagnostics
}

/** Get the current diagnostics. */
export function getDiagnostics(): DiagnosticItem[] {
  return currentDiagnostics
}

/**
 * Map our severity to Monaco MarkerSeverity.
 */
function toMonacoSeverity(
  severity: DiagnosticSeverity,
  monaco: Monaco
): MonacoEditor.MarkerSeverity {
  switch (severity) {
    case 'error':
      return monaco.MarkerSeverity.Error
    case 'warning':
      return monaco.MarkerSeverity.Warning
    case 'info':
      return monaco.MarkerSeverity.Info
    case 'hint':
      return monaco.MarkerSeverity.Hint
  }
}

/**
 * Apply the current diagnostics as Monaco markers on the given model.
 */
export function applyDiagnostics(monaco: Monaco, model: MonacoEditor.editor.ITextModel): void {
  const markers: MonacoEditor.editor.IMarkerData[] = currentDiagnostics.map((d) => ({
    severity: toMonacoSeverity(d.severity, monaco),
    startLineNumber: d.line ?? 1,
    startColumn: d.startColumn ?? 1,
    endLineNumber: d.line ?? 1,
    endColumn: d.endColumn ?? END_OF_LINE_COLUMN,
    message: d.message,
    source: d.source,
  }))

  monaco.editor.setModelMarkers(model, 'turtle', markers)
}

/**
 * Clear all diagnostics from the model.
 */
export function clearDiagnostics(monaco: Monaco, model: MonacoEditor.editor.ITextModel): void {
  currentDiagnostics = []
  monaco.editor.setModelMarkers(model, 'turtle', [])
}
