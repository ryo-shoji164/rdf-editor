import { useEffect, useRef } from 'react'
import Editor, { type Monaco } from '@monaco-editor/react'
import type * as MonacoEditor from 'monaco-editor'
import { useRdfStore } from '../../store/rdfStore'
import { registerTurtleLanguage } from '../../lib/editor/languageSetup'
import { registerCompletionProvider, disposeCompletionProvider } from '../../lib/editor/completionProvider'
import { fromParseError, setDiagnostics, applyDiagnostics, clearDiagnostics } from '../../lib/editor/diagnosticsProvider'

export default function TurtleEditor() {
  const turtleText = useRdfStore((s) => s.turtleText)
  const setTurtleText = useRdfStore((s) => s.setTurtleText)
  const parseError = useRdfStore((s) => s.parseError)
  const isParsing = useRdfStore((s) => s.isParsing)
  const editorRef = useRef<MonacoEditor.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)

  // Sync parse errors to Monaco markers via diagnosticsProvider
  useEffect(() => {
    const monaco = monacoRef.current
    const editor = editorRef.current
    if (!monaco || !editor) return

    const model = editor.getModel()
    if (!model) return

    const diagnostics = fromParseError(parseError)
    setDiagnostics(diagnostics)

    if (diagnostics.length > 0) {
      applyDiagnostics(monaco, model)
    } else {
      clearDiagnostics(monaco, model)
    }
  }, [parseError])

  // Cleanup completion provider on unmount
  useEffect(() => {
    return () => {
      disposeCompletionProvider()
    }
  }, [])

  function handleMount(editor: MonacoEditor.editor.IStandaloneCodeEditor, monaco: Monaco) {
    editorRef.current = editor
    monacoRef.current = monaco

    // Register language & theme
    registerTurtleLanguage(monaco)
    monaco.editor.setTheme('rdf-dark')

    // Register completion provider
    registerCompletionProvider(monaco)
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
          // Enable suggestions (auto-completion)
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
        }}
      />
      {/* Parse status bar */}
      <div className="flex items-center gap-2 px-3 py-1 border-t border-surface-raised text-xs">
        {isParsing && <span className="text-text-muted">Parsing…</span>}
        {!isParsing && parseError && <span className="text-accent-red truncate">{parseError}</span>}
        {!isParsing && !parseError && <span className="text-accent-green">OK</span>}
      </div>
    </div>
  )
}
