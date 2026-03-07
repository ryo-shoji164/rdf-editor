import { useEffect, useRef } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import type * as MonacoEditor from 'monaco-editor'
import { useAppStore } from '../../store/appStore'

/** Sentinel column used to highlight an error squiggle to end-of-line in Monaco. */
const END_OF_LINE_COLUMN = 9999

// Register Turtle language tokens once
function registerTurtleLanguage(monaco: Monaco) {
  if (monaco.languages.getLanguages().some((l) => l.id === 'turtle')) return

  monaco.languages.register({ id: 'turtle', extensions: ['.ttl', '.turtle'] })

  monaco.languages.setMonarchTokensProvider('turtle', {
    defaultToken: '',
    tokenizer: {
      root: [
        // Comments
        [/#.*$/, 'comment'],
        // @prefix / @base directives
        // NOTE: use string pattern (not regex literal) so Monarch does not
        // interpret @ as an attribute reference.
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

export default function TurtleEditor() {
  const turtleText = useAppStore((s) => s.turtleText)
  const setTurtleText = useAppStore((s) => s.setTurtleText)
  const parseError = useAppStore((s) => s.parseError)
  const isParsing = useAppStore((s) => s.isParsing)
  const editorRef = useRef<MonacoEditor.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)

  // Sync parse errors to Monaco markers
  useEffect(() => {
    const monaco = monacoRef.current
    const editor = editorRef.current
    if (!monaco || !editor) return

    const model = editor.getModel()
    if (!model) return

    if (parseError) {
      // Try to extract line number from error message
      const lineMatch = parseError.match(/line (\d+)/i)
      const line = lineMatch ? parseInt(lineMatch[1], 10) : 1

      monaco.editor.setModelMarkers(model, 'turtle', [
        {
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: END_OF_LINE_COLUMN,
          message: parseError,
        },
      ])
    } else {
      monaco.editor.setModelMarkers(model, 'turtle', [])
    }
  }, [parseError])

  function handleMount(editor: MonacoEditor.editor.IStandaloneCodeEditor, monaco: Monaco) {
    editorRef.current = editor
    monacoRef.current = monaco
    registerTurtleLanguage(monaco)
    monaco.editor.setTheme('rdf-dark')
  }

  return (
    <div className="flex flex-col h-full">
      <Editor
        height="100%"
        language="turtle"
        value={turtleText}
        onChange={(v) => setTurtleText(v ?? '')}
        onMount={handleMount}
        theme="rdf-dark"
        options={{
          fontSize: 13,
          lineHeight: 21,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'off',
          renderWhitespace: 'none',
          tabSize: 4,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
        }}
      />
      {/* Parse status bar */}
      <div className="flex items-center gap-2 px-3 py-1 border-t border-surface-raised text-xs">
        {isParsing && (
          <span className="text-text-muted">Parsing…</span>
        )}
        {!isParsing && parseError && (
          <span className="text-accent-red truncate">{parseError}</span>
        )}
        {!isParsing && !parseError && (
          <span className="text-accent-green">OK</span>
        )}
      </div>
    </div>
  )
}
