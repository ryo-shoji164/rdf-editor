/**
 * Turtle Completion Provider for Monaco Editor
 *
 * Provides context-aware auto-completion for Turtle documents using
 * vocabulary items from the active domain plugin.
 *
 * Extension point: inject vocabulary items via `setVocabulary()` to add
 * domain-specific completions dynamically.
 */
import type { Monaco } from '@monaco-editor/react'
import type * as MonacoEditor from 'monaco-editor'
import { COMMON_PREFIXES } from './vocabularies'

// ─── Vocabulary item type (matches DomainPlugin.VocabularyItem) ───

export type CompletionItemKind = 'class' | 'property' | 'datatype' | 'individual'

export interface CompletionVocabularyItem {
  /** Full IRI of the vocabulary term */
  iri: string
  /** Prefixed form, e.g. "samm:Aspect" */
  prefixedName: string
  /** Short label for completion menu */
  label: string
  /** Kind of term — drives the completion icon */
  kind: CompletionItemKind
  /** One-line description for completion detail */
  description?: string
  /** Expected position: 'subject' | 'predicate' | 'object' | 'any' */
  position?: 'subject' | 'predicate' | 'object' | 'any'
}

// ─── Internal state ───────────────────────────────────────────────

let vocabularyItems: CompletionVocabularyItem[] = []
let disposable: MonacoEditor.IDisposable | null = null

// ─── Public API ───────────────────────────────────────────────────

/**
 * Set the vocabulary items used for auto-completion.
 * Call this when the active domain changes.
 */
export function setVocabulary(items: CompletionVocabularyItem[]): void {
  vocabularyItems = items
}

/** Get the currently loaded vocabulary items. */
export function getVocabulary(): CompletionVocabularyItem[] {
  return vocabularyItems
}

/**
 * Map our kind to Monaco CompletionItemKind.
 */
function toMonacoKind(
  kind: CompletionItemKind,
  monaco: Monaco
): MonacoEditor.languages.CompletionItemKind {
  switch (kind) {
    case 'class':
      return monaco.languages.CompletionItemKind.Class
    case 'property':
      return monaco.languages.CompletionItemKind.Property
    case 'datatype':
      return monaco.languages.CompletionItemKind.Struct
    case 'individual':
      return monaco.languages.CompletionItemKind.Value
    default:
      return monaco.languages.CompletionItemKind.Text
  }
}

/**
 * Determine the expected position in the triple based on cursor context.
 * This is a heuristic based on the text before the cursor on the current line.
 */
function inferPosition(textBeforeCursor: string): 'subject' | 'predicate' | 'object' | 'any' {
  const trimmed = textBeforeCursor.trimStart()

  // Empty line or start of statement → subject position
  if (!trimmed || trimmed.endsWith('.')) return 'subject'

  // After subject (has one token, cursor after space) → predicate position
  // After "a" keyword → object position
  if (/\ba\s+$/.test(trimmed)) return 'object'

  // Count tokens roughly: if we have subject + predicate → object
  const tokens = trimmed.split(/\s+/).filter(Boolean)
  if (tokens.length === 1) return 'predicate'
  if (tokens.length >= 2) return 'object'

  return 'any'
}

/**
 * Register the Turtle completion provider with Monaco.
 * Re-registering disposes the previous provider.
 */
export function registerCompletionProvider(monaco: Monaco): void {
  // Dispose previous registration
  if (disposable) {
    disposable.dispose()
    disposable = null
  }

  disposable = monaco.languages.registerCompletionItemProvider('turtle', {
    triggerCharacters: [':', '<', ' ', '\n'],

    provideCompletionItems(
      model: MonacoEditor.editor.ITextModel,
      position: MonacoEditor.Position
    ): MonacoEditor.languages.CompletionList {
      const textBeforeCursor = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      })

      // Extract the word being typed (after last space or start of line)
      const wordMatch = textBeforeCursor.match(/([@a-zA-Z_][\w-]*:?[\w-]*)$/)
      const currentWord = wordMatch ? wordMatch[1] : ''

      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column - (wordMatch ? wordMatch[1].length : 0),
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      }

      const suggestions: MonacoEditor.languages.CompletionItem[] = []

      // 1. Suggest `@prefix` keyword
      if (currentWord.startsWith('@')) {
        suggestions.push({
          label: '@prefix',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '@prefix ',
          range,
          sortText: '0',
        })
      }

      // 2. Suggest well-known prefixes after `@prefix`
      if (textBeforeCursor.trim().startsWith('@prefix')) {
        COMMON_PREFIXES.forEach((p) => {
          suggestions.push({
            label: p.prefix + ':',
            kind: monaco.languages.CompletionItemKind.Module,
            detail: p.description,
            documentation: p.uri,
            insertText: `${p.prefix}: <${p.uri}> .`,
            range,
            sortText: '1',
          })
        })
        return { suggestions }
      }

      // 3. Suggest prefixes before ':'
      if (!currentWord.includes(':') && !currentWord.startsWith('@')) {
        COMMON_PREFIXES.forEach((p) => {
          suggestions.push({
            label: p.prefix + ':',
            kind: monaco.languages.CompletionItemKind.Module,
            detail: p.description,
            documentation: p.uri,
            insertText: p.prefix + ':',
            range,
            sortText: '2',
          })
        })
      }

      const inferredPosition = inferPosition(textBeforeCursor)

      // 4. Suggest vocabulary items
      const vocabSuggestions = vocabularyItems
        .filter((item) => {
          if (item.position && item.position !== 'any' && inferredPosition !== 'any') {
            if (item.position !== inferredPosition) return false
          }
          if (currentWord) {
            return (
              item.prefixedName.toLowerCase().startsWith(currentWord.toLowerCase()) ||
              item.label.toLowerCase().startsWith(currentWord.toLowerCase())
            )
          }
          return true
        })
        .map((item) => ({
          label: item.prefixedName,
          kind: toMonacoKind(item.kind, monaco),
          detail: item.description ?? item.iri,
          documentation: item.iri,
          insertText: item.prefixedName,
          range,
          sortText: item.kind === 'class' ? '3' : item.kind === 'property' ? '4' : '5',
        }))

      suggestions.push(...vocabSuggestions)

      return { suggestions }
    },
  })
}

/**
 * Dispose the completion provider. Call on cleanup.
 */
export function disposeCompletionProvider(): void {
  if (disposable) {
    disposable.dispose()
    disposable = null
  }
}
