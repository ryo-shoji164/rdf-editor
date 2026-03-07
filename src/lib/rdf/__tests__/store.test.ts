import { describe, it, expect } from 'vitest'
import * as N3 from 'n3'
import {
    storeToTriples,
    getSubjects,
    getTriplesForSubject,
    getOne,
    getAll,
    resolveRdfList,
    getLabel,
} from '../store'

const { namedNode, literal, quad, blankNode } = N3.DataFactory

function makeTestStore(): N3.Store {
    const store = new N3.Store()
    store.add(quad(
        namedNode('http://example.org/alice'),
        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        namedNode('http://xmlns.com/foaf/0.1/Person'),
    ))
    store.add(quad(
        namedNode('http://example.org/alice'),
        namedNode('http://xmlns.com/foaf/0.1/name'),
        literal('Alice'),
    ))
    store.add(quad(
        namedNode('http://example.org/alice'),
        namedNode('http://xmlns.com/foaf/0.1/knows'),
        namedNode('http://example.org/bob'),
    ))
    store.add(quad(
        namedNode('http://example.org/bob'),
        namedNode('http://xmlns.com/foaf/0.1/name'),
        literal('Bob'),
    ))
    return store
}

describe('storeToTriples', () => {
    it('converts all quads to Triple objects', () => {
        const triples = storeToTriples(makeTestStore())
        expect(triples).toHaveLength(4)
        const aliceName = triples.find((t) => t.object === 'Alice')
        expect(aliceName).toBeDefined()
        expect(aliceName!.objectType).toBe('literal')
        expect(aliceName!.subject).toBe('http://example.org/alice')
    })
})

describe('getSubjects', () => {
    it('returns unique subjects', () => {
        const subjects = getSubjects(makeTestStore())
        expect(subjects).toContain('http://example.org/alice')
        expect(subjects).toContain('http://example.org/bob')
        expect(subjects).toHaveLength(2)
    })
})

describe('getTriplesForSubject', () => {
    it('returns all triples for a given subject', () => {
        const triples = getTriplesForSubject(makeTestStore(), 'http://example.org/alice')
        expect(triples).toHaveLength(3) // type, name, knows
    })

    it('returns empty array for unknown subject', () => {
        const triples = getTriplesForSubject(makeTestStore(), 'http://example.org/unknown')
        expect(triples).toHaveLength(0)
    })
})

describe('getOne', () => {
    it('returns first value of a predicate', () => {
        const name = getOne(makeTestStore(), 'http://example.org/alice', 'http://xmlns.com/foaf/0.1/name')
        expect(name).toBe('Alice')
    })

    it('returns undefined when predicate not found', () => {
        const val = getOne(makeTestStore(), 'http://example.org/alice', 'http://example.org/nonexistent')
        expect(val).toBeUndefined()
    })
})

describe('getAll', () => {
    it('returns all values of a predicate', () => {
        const store = makeTestStore()
        // Alice knows Bob; add Carol
        store.add(quad(
            namedNode('http://example.org/alice'),
            namedNode('http://xmlns.com/foaf/0.1/knows'),
            namedNode('http://example.org/carol'),
        ))
        const known = getAll(store, 'http://example.org/alice', 'http://xmlns.com/foaf/0.1/knows')
        expect(known).toHaveLength(2)
        expect(known).toContain('http://example.org/bob')
        expect(known).toContain('http://example.org/carol')
    })
})

describe('resolveRdfList', () => {
    it('resolves an RDF list', () => {
        const store = new N3.Store()
        const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'

        // resolveRdfList uses getOne which uses namedNode(), so we need
        // to use named nodes (IRIs) rather than blank nodes for the list nodes
        const n1 = namedNode('http://example.org/list1')
        const n2 = namedNode('http://example.org/list2')
        store.add(quad(n1, namedNode(`${RDF}first`), literal('a')))
        store.add(quad(n1, namedNode(`${RDF}rest`), n2))
        store.add(quad(n2, namedNode(`${RDF}first`), literal('b')))
        store.add(quad(n2, namedNode(`${RDF}rest`), namedNode(`${RDF}nil`)))

        const items = resolveRdfList(store, 'http://example.org/list1')
        expect(items).toEqual(['a', 'b'])
    })
})

describe('getLabel', () => {
    it('returns rdfs:label when available', () => {
        const store = makeTestStore()
        store.add(quad(
            namedNode('http://example.org/alice'),
            namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            literal('Alice Wonder'),
        ))
        expect(getLabel(store, 'http://example.org/alice')).toBe('Alice Wonder')
    })

    it('falls back to shortened IRI when no label', () => {
        const label = getLabel(makeTestStore(), 'http://example.org/alice')
        // Should use shorten, which extracts 'alice' from the IRI
        expect(label).toBe('alice')
    })
})
