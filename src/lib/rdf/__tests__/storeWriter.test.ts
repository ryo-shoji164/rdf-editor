import { describe, it, expect, beforeEach } from 'vitest'
import * as N3 from 'n3'
import type { Triple } from '../../../types/rdf'
import {
  addTriple,
  removeTriple,
  updateTriple,
  addTriples,
  removeTriples,
  removeSubject,
  tripleToQuad,
} from '../storeWriter'

const { namedNode } = N3.DataFactory

// ─── Fixtures ─────────────────────────────────────────────────────

const tripleA: Triple = {
  subject: 'http://example.org/alice',
  predicate: 'http://xmlns.com/foaf/0.1/name',
  object: 'Alice',
  objectType: 'literal',
}

const tripleB: Triple = {
  subject: 'http://example.org/alice',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://xmlns.com/foaf/0.1/Person',
  objectType: 'iri',
}

const tripleC: Triple = {
  subject: 'http://example.org/bob',
  predicate: 'http://xmlns.com/foaf/0.1/name',
  object: 'Bob',
  objectType: 'literal',
}

const tripleLang: Triple = {
  subject: 'http://example.org/alice',
  predicate: 'http://xmlns.com/foaf/0.1/name',
  object: 'アリス',
  objectType: 'literal',
  language: 'ja',
}

const tripleTyped: Triple = {
  subject: 'http://example.org/alice',
  predicate: 'http://xmlns.com/foaf/0.1/age',
  object: '30',
  objectType: 'literal',
  datatype: 'http://www.w3.org/2001/XMLSchema#integer',
}

const tripleBlank: Triple = {
  subject: '_:b0',
  predicate: 'http://xmlns.com/foaf/0.1/name',
  object: 'Anon',
  objectType: 'literal',
}

let store: N3.Store

beforeEach(() => {
  store = new N3.Store()
})

// ─── tripleToQuad ─────────────────────────────────────────────────

describe('tripleToQuad', () => {
  it('converts IRI object', () => {
    const q = tripleToQuad(tripleB)
    expect(q.subject.value).toBe('http://example.org/alice')
    expect(q.predicate.value).toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
    expect(q.object.value).toBe('http://xmlns.com/foaf/0.1/Person')
    expect(q.object.termType).toBe('NamedNode')
  })

  it('converts literal object', () => {
    const q = tripleToQuad(tripleA)
    expect(q.object.termType).toBe('Literal')
    expect(q.object.value).toBe('Alice')
  })

  it('converts literal with language tag', () => {
    const q = tripleToQuad(tripleLang)
    expect(q.object.termType).toBe('Literal')
    expect((q.object as N3.Literal).language).toBe('ja')
  })

  it('converts literal with datatype', () => {
    const q = tripleToQuad(tripleTyped)
    expect(q.object.termType).toBe('Literal')
    expect((q.object as N3.Literal).datatype.value).toBe('http://www.w3.org/2001/XMLSchema#integer')
  })

  it('converts blank node subject', () => {
    const q = tripleToQuad(tripleBlank)
    expect(q.subject.termType).toBe('BlankNode')
    expect(q.subject.value).toBe('b0')
  })
})

// ─── addTriple ────────────────────────────────────────────────────

describe('addTriple', () => {
  it('adds a triple and returns true', () => {
    const result = addTriple(store, tripleA)
    expect(result).toBe(true)
    expect(store.size).toBe(1)
  })

  it('returns false when triple already exists', () => {
    addTriple(store, tripleA)
    const result = addTriple(store, tripleA)
    expect(result).toBe(false)
    expect(store.size).toBe(1)
  })

  it('handles IRI, literal, and blank node objects', () => {
    addTriple(store, tripleA) // literal
    addTriple(store, tripleB) // IRI
    addTriple(store, tripleBlank) // blank node subject
    expect(store.size).toBe(3)
  })
})

// ─── removeTriple ─────────────────────────────────────────────────

describe('removeTriple', () => {
  it('removes a triple and returns true', () => {
    addTriple(store, tripleA)
    const result = removeTriple(store, tripleA)
    expect(result).toBe(true)
    expect(store.size).toBe(0)
  })

  it('returns false when triple does not exist', () => {
    const result = removeTriple(store, tripleA)
    expect(result).toBe(false)
  })
})

// ─── updateTriple ─────────────────────────────────────────────────

describe('updateTriple', () => {
  it('replaces old triple with new triple', () => {
    addTriple(store, tripleA)
    const updated: Triple = { ...tripleA, object: 'Bob' }
    const result = updateTriple(store, tripleA, updated)
    expect(result).toBe(true)
    expect(store.size).toBe(1)

    // Verify new value
    const quads = store.getQuads(
      namedNode('http://example.org/alice'),
      namedNode('http://xmlns.com/foaf/0.1/name'),
      null,
      null
    )
    expect(quads).toHaveLength(1)
    expect(quads[0].object.value).toBe('Bob')
  })

  it('returns true even if old triple was not found (adds new)', () => {
    const result = updateTriple(store, tripleA, tripleB)
    expect(result).toBe(true)
    expect(store.size).toBe(1)
  })
})

// ─── addTriples / removeTriples ───────────────────────────────────

describe('addTriples', () => {
  it('adds multiple triples and returns count', () => {
    const count = addTriples(store, [tripleA, tripleB, tripleC])
    expect(count).toBe(3)
    expect(store.size).toBe(3)
  })

  it('skips duplicates', () => {
    addTriple(store, tripleA)
    const count = addTriples(store, [tripleA, tripleB])
    expect(count).toBe(1) // only tripleB was new
    expect(store.size).toBe(2)
  })
})

describe('removeTriples', () => {
  it('removes multiple triples and returns count', () => {
    addTriples(store, [tripleA, tripleB, tripleC])
    const count = removeTriples(store, [tripleA, tripleC])
    expect(count).toBe(2)
    expect(store.size).toBe(1)
  })
})

// ─── removeSubject ────────────────────────────────────────────────

describe('removeSubject', () => {
  it('removes all triples for a subject', () => {
    addTriples(store, [tripleA, tripleB, tripleC]) // alice x2, bob x1
    const count = removeSubject(store, 'http://example.org/alice')
    expect(count).toBe(2)
    expect(store.size).toBe(1) // only bob remains
  })

  it('returns 0 for unknown subject', () => {
    const count = removeSubject(store, 'http://example.org/unknown')
    expect(count).toBe(0)
  })
})

// ─── Integration: round-trip via store ────────────────────────────

describe('round-trip: add → query → verify', () => {
  it('added triples are queryable via N3.Store', () => {
    addTriple(store, tripleA)
    addTriple(store, tripleB)

    const aliceTriples = store.getQuads(namedNode('http://example.org/alice'), null, null, null)
    expect(aliceTriples).toHaveLength(2)

    const names = store.getQuads(
      namedNode('http://example.org/alice'),
      namedNode('http://xmlns.com/foaf/0.1/name'),
      null,
      null
    )
    expect(names).toHaveLength(1)
    expect(names[0].object.value).toBe('Alice')
  })
})
