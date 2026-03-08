/**
 * Turtle Language Setup for Monaco Editor
 *
 * Extracted from TurtleEditor.tsx for modularity.
 * Registers the 'turtle' language and its Monarch tokenizer + theme.
 */
import type { Monaco } from '@monaco-editor/react'
import type * as MonacoEditor from 'monaco-editor'

/** Register Turtle language if not already registered. */
export function registerTurtleLanguage(monaco: Monaco): void {
  if (
    monaco.languages
      .getLanguages()
      .some((l: MonacoEditor.languages.ILanguageExtensionPoint) => l.id === 'turtle')
  )
    return

  monaco.languages.register({ id: 'turtle', extensions: ['.ttl', '.turtle'] })

  monaco.languages.setMonarchTokensProvider('turtle', {
    defaultToken: '',
    tokenizer: {
      root: [
        // Comments
        [/#.*$/, 'comment'],
        // @prefix / @base directives
        ['\\@(?:prefix|base)\\b', 'keyword'],
        // SPARQL-style keywords
        [/\b(?:PREFIX|BASE|SELECT|WHERE|FILTER|OPTIONAL)\b/, 'keyword'],
        // IRI references
        [/<[^>]*>/, 'string.iri'],
        // Prefixed names
        [/[a-zA-Z_\u00C0-\u00FF][\w\u00C0-\u00FF]*:[\w\u00C0-\u00FF]*/, 'type'],
        // Blank node labels
        [/_:[\w\u00C0-\u00FF]+/, 'variable'],
        // Literals with language tag
        [/"[^"\\]*(?:\\.[^"\\]*)*"@[a-zA-Z][-a-zA-Z]*/, 'string.lang'],
        // Literals with datatype
        [/"[^"\\]*(?:\\.[^"\\]*)*"\^\^/, { token: 'string', next: '@datatype' }],
        // Triple-quoted strings
        [/"""/, { token: 'string', next: '@triplestring' }],
        // Regular strings
        [/"[^"\\]*(?:\\.[^"\\]*)*"/, 'string'],
        // Numbers
        [/[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/, 'number'],
        // Boolean
        [/\b(true|false)\b/, 'keyword.constant'],
        // Punctuation
        [/[;,.]/, 'delimiter'],
        [/[()]/, 'delimiter.parenthesis'],
        [/\[\]/, 'variable.blank'],
        [/\[/, 'delimiter.square'],
        [/\]/, 'delimiter.square'],
        // 'a' keyword shorthand
        [/\ba\b/, 'keyword'],
      ],
      datatype: [
        [/<[^>]*>/, { token: 'string.iri', next: '@pop' }],
        [/[a-zA-Z_][\w]*:[\w]+/, { token: 'type', next: '@pop' }],
        [/$/, '', '@pop'],
      ],
      triplestring: [
        [/"""/, { token: 'string', next: '@pop' }],
        [/./, 'string'],
      ],
    },
  })

  // Define color theme for Turtle
  monaco.editor.defineTheme('rdf-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6c7086', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'cba6f7', fontStyle: 'bold' },
      { token: 'keyword.constant', foreground: 'fab387' },
      { token: 'string.iri', foreground: 'a6e3a1' },
      { token: 'string.lang', foreground: 'f9e2af' },
      { token: 'string', foreground: 'a6e3a1' },
      { token: 'type', foreground: '89b4fa' },
      { token: 'variable', foreground: 'f38ba8' },
      { token: 'variable.blank', foreground: '6c7086' },
      { token: 'number', foreground: 'fab387' },
      { token: 'delimiter', foreground: 'cdd6f4' },
      { token: 'delimiter.parenthesis', foreground: 'cdd6f4' },
      { token: 'delimiter.square', foreground: 'cdd6f4' },
    ],
    colors: {
      'editor.background': '#1e1e2e',
      'editor.foreground': '#cdd6f4',
      'editor.lineHighlightBackground': '#313244',
      'editor.selectionBackground': '#45475a',
      'editorLineNumber.foreground': '#45475a',
      'editorLineNumber.activeForeground': '#cdd6f4',
      'editorCursor.foreground': '#f5c2e7',
      'editor.findMatchBackground': '#f9e2af44',
      'editor.findMatchHighlightBackground': '#f9e2af22',
    },
  })
}
