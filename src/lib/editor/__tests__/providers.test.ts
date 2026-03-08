import { describe, it, expect, beforeEach } from 'vitest'
import { setVocabulary, getVocabulary, type CompletionVocabularyItem } from '../completionProvider'
import { fromParseError, setDiagnostics, getDiagnostics } from '../diagnosticsProvider'

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
})
