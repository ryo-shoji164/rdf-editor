import { describe, it, expect, beforeEach } from 'vitest'
import * as N3 from 'n3'
import { addTriple, removeTriple, updateTriple, tripleToQuad } from './storeWriter'
import type { Triple } from '../../types/rdf'

describe('storeWriter', () => {
  let store: N3.Store

  beforeEach(() => {
    store = new N3.Store()
  })

  describe('tripleToQuad', () => {
    it('converts basic iri to iri to literal triple', () => {
      const triple: Triple = {
        subject: 'http://example.org/Subj',
        predicate: 'http://example.org/Pred',
        object: 'LiteralValue',
        objectType: 'literal',
      }
      const quad = tripleToQuad(triple)
      expect(quad.subject.termType).toBe('NamedNode')
      expect(quad.subject.value).toBe('http://example.org/Subj')
      expect(quad.object.termType).toBe('Literal')
      expect(quad.object.value).toBe('LiteralValue')
    })
  })

  describe('addTriple', () => {
    it('adds a literal triple and returns true', () => {
      const triple: Triple = {
        subject: 'http://ex.org/S',
        predicate: 'http://ex.org/P',
        object: 'Value',
        objectType: 'literal',
      }

      const newlyAdded = addTriple(store, triple)
      expect(newlyAdded).toBe(true)
      expect(store.size).toBe(1)
    })

    it('returns false if triple already exists', () => {
      const triple: Triple = {
        subject: 'http://ex.org/S',
        predicate: 'http://ex.org/P',
        object: 'Value',
        objectType: 'literal',
      }
      addTriple(store, triple)
      const addedAgain = addTriple(store, triple)

      expect(addedAgain).toBe(false)
      expect(store.size).toBe(1)
    })
  })

  describe('removeTriple', () => {
    it('removes an existing triple', () => {
      const triple: Triple = {
        subject: 'http://ex.org/S',
        predicate: 'http://ex.org/P',
        object: 'Value',
        objectType: 'literal',
      }
      addTriple(store, triple)

      const removed = removeTriple(store, triple)
      expect(removed).toBe(true)
      expect(store.size).toBe(0)
    })

    it('returns false if triple does not exist', () => {
      const triple: Triple = {
        subject: 'http://ex.org/S',
        predicate: 'http://ex.org/P',
        object: 'Value',
        objectType: 'literal',
      }

      const removed = removeTriple(store, triple)
      expect(removed).toBe(false)
      expect(store.size).toBe(0)
    })
  })

  describe('updateTriple', () => {
    it('updates a triple subject', () => {
      const oldTriple: Triple = {
        subject: 'http://ex.org/OldS',
        predicate: 'http://ex.org/P',
        object: 'Value',
        objectType: 'literal',
      }
      const newTriple: Triple = {
        ...oldTriple,
        subject: 'http://ex.org/NewS',
      }

      addTriple(store, oldTriple)
      const updated = updateTriple(store, oldTriple, newTriple)

      expect(updated).toBe(true)
      expect(store.size).toBe(1) // still 1 overall

      // Verify new is here, old is gone
      const quads = store.getQuads(null, null, null, null)
      expect(quads[0].subject.value).toBe('http://ex.org/NewS')
    })
  })
})
