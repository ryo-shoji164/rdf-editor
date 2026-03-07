import { describe, it, expect, beforeEach } from 'vitest'
import * as N3 from 'n3'
import { useRdfStore } from '../rdfStore'

// Reset store state before each test
beforeEach(() => {
  useRdfStore.setState({
    turtleText: '',
    store: new N3.Store(),
    prefixes: {},
    parseError: null,
    isParsing: false,
  })
})

describe('rdfStore', () => {
  describe('setTurtleText', () => {
    it('updates turtleText immediately', () => {
      const { setTurtleText } = useRdfStore.getState()
      setTurtleText('some turtle text')
      expect(useRdfStore.getState().turtleText).toBe('some turtle text')
    })

    it('clears parseError on new text', () => {
      useRdfStore.setState({ parseError: 'old error' })
      const { setTurtleText } = useRdfStore.getState()
      setTurtleText('new text')
      expect(useRdfStore.getState().parseError).toBeNull()
    })
  })

  describe('reparseNow', () => {
    it('parses turtleText and populates store', async () => {
      const turtle = `
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
<http://example.org/alice> foaf:name "Alice" .
`
      useRdfStore.setState({ turtleText: turtle })
      await useRdfStore.getState().reparseNow()

      const state = useRdfStore.getState()
      expect(state.store.size).toBe(1)
      expect(state.prefixes).toHaveProperty('foaf')
      expect(state.parseError).toBeNull()
      expect(state.isParsing).toBe(false)
    })

    it('sets parseError for invalid Turtle', async () => {
      useRdfStore.setState({ turtleText: '<bad> <data "unterminated' })
      await useRdfStore.getState().reparseNow()

      const state = useRdfStore.getState()
      expect(state.parseError).toBeTruthy()
    })
  })

  describe('importFile', () => {
    it('imports Turtle content', async () => {
      const content = `
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
<http://example.org/x> rdf:type <http://example.org/Thing> .
`
      await useRdfStore.getState().importFile(content, 'turtle')

      const state = useRdfStore.getState()
      expect(state.store.size).toBe(1)
      expect(state.turtleText).toBeTruthy()
      expect(state.parseError).toBeNull()
    })

    it('imports N-Triples content', async () => {
      const content = '<http://example.org/a> <http://example.org/b> <http://example.org/c> .\n'
      await useRdfStore.getState().importFile(content, 'n-triples')

      const state = useRdfStore.getState()
      expect(state.store.size).toBe(1)
    })

    it('sets error for invalid import', async () => {
      await useRdfStore.getState().importFile('invalid content', 'turtle')
      const state = useRdfStore.getState()
      expect(state.parseError).toBeTruthy()
    })
  })

  describe('clearAll', () => {
    it('resets all state', () => {
      useRdfStore.setState({
        turtleText: 'some text',
        parseError: 'some error',
      })
      useRdfStore.getState().clearAll()

      const state = useRdfStore.getState()
      expect(state.turtleText).toBe('')
      expect(state.store.size).toBe(0)
      expect(state.parseError).toBeNull()
      expect(Object.keys(state.prefixes)).toHaveLength(0)
    })
  })

  describe('applyStoreChange', () => {
    it('serializes store back to turtleText', async () => {
      // Set up store with a triple
      const store = new N3.Store()
      store.add(
        N3.DataFactory.quad(
          N3.DataFactory.namedNode('http://example.org/s'),
          N3.DataFactory.namedNode('http://example.org/p'),
          N3.DataFactory.literal('object')
        )
      )
      useRdfStore.setState({ store, prefixes: {} })

      await useRdfStore.getState().applyStoreChange()

      const text = useRdfStore.getState().turtleText
      expect(text).toContain('http://example.org/s')
      expect(text).toContain('"object"')
    })
  })
})
