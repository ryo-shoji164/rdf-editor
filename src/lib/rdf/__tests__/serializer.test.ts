import { describe, it, expect } from 'vitest'
import * as N3 from 'n3'
import { serializeTurtle, serializeNTriples } from '../serializer'
import { parseTurtle } from '../parser'

const { namedNode, literal, quad } = N3.DataFactory

function makeTestStore(): N3.Store {
    const store = new N3.Store()
    store.add(quad(
        namedNode('http://example.org/alice'),
        namedNode('http://xmlns.com/foaf/0.1/name'),
        literal('Alice'),
    ))
    store.add(quad(
        namedNode('http://example.org/alice'),
        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        namedNode('http://xmlns.com/foaf/0.1/Person'),
    ))
    return store
}

describe('serializeTurtle', () => {
    it('serializes store to Turtle with prefixes', async () => {
        const store = makeTestStore()
        const turtle = await serializeTurtle(store, { foaf: 'http://xmlns.com/foaf/0.1/' })
        expect(turtle).toContain('foaf:name')
        expect(turtle).toContain('"Alice"')
    })

    it('serializes store without prefixes', async () => {
        const store = makeTestStore()
        const turtle = await serializeTurtle(store)
        expect(turtle).toBeTruthy()
        expect(turtle).toContain('Alice')
    })
})

describe('serializeNTriples', () => {
    it('serializes store to N-Triples', async () => {
        const store = makeTestStore()
        const nt = await serializeNTriples(store)
        expect(nt).toContain('<http://example.org/alice>')
        expect(nt).toContain('<http://xmlns.com/foaf/0.1/name>')
        expect(nt).toContain('"Alice"')
        // N-Triples lines end with .
        const lines = nt.trim().split('\n').filter((l) => l.trim())
        expect(lines).toHaveLength(2)
    })
})

describe('round-trip', () => {
    it('parse → serialize → parse produces same triple count', async () => {
        const original = `
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

<http://example.org/alice> a foaf:Person ;
    foaf:name "Alice" ;
    foaf:knows <http://example.org/bob> .

<http://example.org/bob> a foaf:Person ;
    foaf:name "Bob" .
`
        const parsed1 = await parseTurtle(original)
        expect(parsed1.error).toBeUndefined()

        const serialized = await serializeTurtle(parsed1.store, parsed1.prefixes)
        const parsed2 = await parseTurtle(serialized)
        expect(parsed2.error).toBeUndefined()

        expect(parsed2.store.size).toBe(parsed1.store.size)
    })
})
