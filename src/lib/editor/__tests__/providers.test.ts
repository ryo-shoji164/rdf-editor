import { describe, it, expect, beforeEach } from 'vitest'
import {
  setVocabulary,
  getVocabulary,
  registerCompletionProvider,
  type CompletionVocabularyItem,
} from '../completionProvider'
import type { Monaco } from '@monaco-editor/react'
import type * as MonacoEditor from 'monaco-editor'
import {
  fromParseError,
  fromParseErrors,
  setDiagnostics,
  getDiagnostics,
} from '../diagnosticsProvider'
import type { ParseError } from '../../rdf/parser'

// ─── Completion Provider Tests ────────────────────────────────────

describe('completionProvider', () => {
  beforeEach(() => {
    setVocabulary([])
  })

  describe('setVocabulary / getVocabulary', () => {
    it('stores and retrieves vocabulary items', () => {
      const items: CompletionVocabularyItem[] = [
        {
          iri: 'http://xmlns.com/foaf/0.1/Person',
          prefixedName: 'foaf:Person',
          label: 'Person',
          kind: 'class',
          description: 'A person',
        },
      ]
      setVocabulary(items)
      expect(getVocabulary()).toEqual(items)
    })

    it('starts empty', () => {
      expect(getVocabulary()).toHaveLength(0)
    })

    it('replaces previous vocabulary', () => {
      setVocabulary([{ iri: 'http://a', prefixedName: 'a:A', label: 'A', kind: 'class' }])
      setVocabulary([{ iri: 'http://b', prefixedName: 'b:B', label: 'B', kind: 'property' }])
      expect(getVocabulary()).toHaveLength(1)
      expect(getVocabulary()[0].prefixedName).toBe('b:B')
    })
  })

  describe('provideCompletionItems logic', () => {
    it('suggests @prefix and well-known prefixes correctly', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let capturedProvider: any = null
      const mockMonaco = {
        languages: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          registerCompletionItemProvider: (lang: string, provider: any) => {
            capturedProvider = provider
            return { dispose: () => {} }
          },
          CompletionItemKind: {
            Keyword: 1,
            Module: 2,
            Class: 3,
            Property: 4,
            Struct: 5,
            Value: 6,
            Text: 7,
          },
        },
      } as unknown as Monaco

      registerCompletionProvider(mockMonaco)

      const createModel = (textBeforeCursor: string) =>
        ({
          getValueInRange: () => textBeforeCursor,
        }) as unknown as MonacoEditor.editor.ITextModel

      const position = { lineNumber: 1, column: 10 } as MonacoEditor.Position

      // 1. Typing "@" should suggest "@prefix"
      const res1 = capturedProvider.provideCompletionItems(createModel('@'), position)
      expect(res1.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ label: '@prefix', insertText: '@prefix ' }),
        ])
      )

      // 2. Typing "@prefix " should suggest known prefixes
      const res2 = capturedProvider.provideCompletionItems(createModel('@prefix '), position)
      expect(res2.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            label: 'foaf:',
            insertText: 'foaf: <http://xmlns.com/foaf/0.1/> .',
          }),
        ])
      )

      // 3. Typing "@prefix foa" should suggest "foaf:"
      const res3 = capturedProvider.provideCompletionItems(createModel('@prefix foa'), position)
      expect(res3.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            label: 'foaf:',
            insertText: 'foaf: <http://xmlns.com/foaf/0.1/> .',
          }),
        ])
      )

      // 4. Entering URI (e.g. "@prefix foaf: <") should NOT suggest well-known prefixes
      const res4 = capturedProvider.provideCompletionItems(createModel('@prefix foaf: <'), position)
      expect(res4.suggestions).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ label: 'foaf:' })])
      )
    })
  })
})

// ─── Diagnostics Provider Tests ───────────────────────────────────

describe('diagnosticsProvider', () => {
  beforeEach(() => {
    setDiagnostics([])
  })

  describe('fromParseError', () => {
    it('returns empty array for null', () => {
      expect(fromParseError(null)).toEqual([])
    })

    it('returns empty array for empty string', () => {
      expect(fromParseError('')).toEqual([])
    })

    it('creates diagnostic from error string', () => {
      const diagnostics = fromParseError('Unexpected token at line 5')
      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0].message).toBe('Unexpected token at line 5')
      expect(diagnostics[0].severity).toBe('error')
      expect(diagnostics[0].line).toBe(5)
      expect(diagnostics[0].source).toBe('parser')
    })

    it('defaults to line 1 when no line number in error', () => {
      const diagnostics = fromParseError('Something went wrong')
      expect(diagnostics[0].line).toBe(1)
    })

    it('extracts case-insensitive line numbers', () => {
      const diagnostics = fromParseError('Error on Line 42: invalid syntax')
      expect(diagnostics[0].line).toBe(42)
    })
  })

  describe('setDiagnostics / getDiagnostics', () => {
    it('stores and retrieves diagnostics', () => {
      const items = [{ message: 'test', severity: 'error' as const }]
      setDiagnostics(items)
      expect(getDiagnostics()).toEqual(items)
    })

    it('replaces previous diagnostics', () => {
      setDiagnostics([{ message: 'a', severity: 'error' }])
      setDiagnostics([{ message: 'b', severity: 'warning' }])
      expect(getDiagnostics()).toHaveLength(1)
      expect(getDiagnostics()[0].message).toBe('b')
    })
  })

  describe('fromParseErrors', () => {
    it('returns empty array for empty input', () => {
      expect(fromParseErrors([])).toEqual([])
    })

    it('converts a single ParseError to DiagnosticItem', () => {
      const errors: ParseError[] = [
        { message: 'Unexpected token on line 5.', severity: 'error', line: 5, column: 3 },
      ]
      const diagnostics = fromParseErrors(errors)
      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0].message).toBe('Unexpected token on line 5.')
      expect(diagnostics[0].severity).toBe('error')
      expect(diagnostics[0].line).toBe(5)
      expect(diagnostics[0].startColumn).toBe(3)
      expect(diagnostics[0].source).toBe('parser')
    })

    it('converts multiple ParseErrors to DiagnosticItems', () => {
      const errors: ParseError[] = [
        { message: 'Error on line 2.', severity: 'error', line: 2, column: 1 },
        { message: 'Warning on line 7.', severity: 'warning', line: 7, column: 5 },
        { message: 'Info on line 10.', severity: 'info', line: 10, column: 1 },
      ]
      const diagnostics = fromParseErrors(errors)
      expect(diagnostics).toHaveLength(3)
      expect(diagnostics[0].severity).toBe('error')
      expect(diagnostics[1].severity).toBe('warning')
      expect(diagnostics[2].severity).toBe('info')
      expect(diagnostics[1].line).toBe(7)
      expect(diagnostics[1].startColumn).toBe(5)
    })

    it('preserves all severity levels', () => {
      const severities = ['error', 'warning', 'info'] as const
      for (const severity of severities) {
        const errors: ParseError[] = [{ message: 'msg', severity, line: 1, column: 1 }]
        const diagnostics = fromParseErrors(errors)
        expect(diagnostics[0].severity).toBe(severity)
      }
    })
  })
})
