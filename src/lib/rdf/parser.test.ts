import { describe, it, expect } from 'vitest'
import { parseTurtle, parseNTriples, parseAuto } from './parser'

describe('RDF Parser', () => {
    describe('parseTurtle', () => {
        it('successfully parses valid Turtle string', async () => {
            const turtle = `
        @prefix ex: <http://example.org/> .
        ex:Subject ex:predicate "Object" .
      `
            const { store, prefixes, error } = await parseTurtle(turtle)

            expect(error).toBeUndefined()
            expect(store.size).toBe(1)
            expect(prefixes).toHaveProperty('ex', 'http://example.org/')

            const quads = store.getQuads(null, null, null, null)
            expect(quads[0].subject.value).toBe('http://example.org/Subject')
            expect(quads[0].predicate.value).toBe('http://example.org/predicate')
            expect(quads[0].object.value).toBe('Object')
        })

        it('returns an error for invalid Turtle string', async () => {
            const invalidTurtle = `invalid turtle syntax`
            const { store, prefixes, error } = await parseTurtle(invalidTurtle)

            expect(error).toBeDefined()
            expect(error).toContain('Unexpected')
            expect(store.size).toBe(0)
        })
    })

    describe('parseNTriples', () => {
        it('successfully parses valid N-Triples string', async () => {
            const ntriples = `<http://example.org/Subject> <http://example.org/predicate> "Object" .`
            const { store, prefixes, error } = await parseNTriples(ntriples)

            expect(error).toBeUndefined()
            expect(store.size).toBe(1)
            expect(Object.keys(prefixes).length).toBe(0) // N-Triples doesn't have prefixes
        })
    })

    describe('parseAuto', () => {
        it('defaults to Turtle when no hint is provided and not JSON', async () => {
            const turtle = `@prefix ex: <http://example.org/> . ex:A ex:B ex:C .`
            const { store, error } = await parseAuto(turtle)
            expect(error).toBeUndefined()
            expect(store.size).toBe(1)
        })

        it('parses JSON-LD based on content', async () => {
            // NOTE: This will fail if jsonld handles it unexpectedly or network is required for contexts
            // But simple JSON-LD should work
            const jsonldStr = JSON.stringify({
                "@context": { "name": "http://xmlns.com/foaf/0.1/name" },
                "@id": "http://example.org/1",
                "name": "Test Name"
            })
            const { store, error } = await parseAuto(jsonldStr)
            expect(error).toBeUndefined()
            expect(store.size).toBe(1)
            const quads = store.getQuads(null, null, null, null)
            expect(quads[0].object.value).toBe('Test Name')
        })
    })
})
