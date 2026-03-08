import { describe, it, expect } from 'vitest'
import { parseTurtle, parseNTriples, parseJsonLd, parseAuto } from '../parser'

const VALID_TURTLE = `
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<http://example.org/alice> a foaf:Person ;
    foaf:name "Alice" ;
    foaf:age 30 .
`

const INVALID_TURTLE = `
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
<http://example.org/alice> foaf:name "Alice
`

const VALID_NTRIPLES = `<http://example.org/alice> <http://xmlns.com/foaf/0.1/name> "Alice" .
<http://example.org/alice> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .
`

describe('parseTurtle', () => {
  it('parses valid Turtle and returns store + prefixes', async () => {
    const result = await parseTurtle(VALID_TURTLE)
    expect(result.error).toBeUndefined()
    expect(result.store.size).toBe(3) // alice a Person, name, age
    expect(result.prefixes).toHaveProperty('foaf')
    expect(result.prefixes.foaf).toBe('http://xmlns.com/foaf/0.1/')
  })

  it('returns error for invalid Turtle', async () => {
    const result = await parseTurtle(INVALID_TURTLE)
    expect(result.error).toBeDefined()
    expect(result.error).toBeTruthy()
  })

  it('handles empty string without error', async () => {
    const result = await parseTurtle('')
    expect(result.error).toBeUndefined()
    expect(result.store.size).toBe(0)
  })

  it('handles only prefix declarations', async () => {
    const result = await parseTurtle('@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .')
    expect(result.error).toBeUndefined()
    expect(result.store.size).toBe(0)
    expect(result.prefixes).toHaveProperty('rdf')
  })
})

describe('parseNTriples', () => {
  it('parses valid N-Triples', async () => {
    const result = await parseNTriples(VALID_NTRIPLES)
    expect(result.error).toBeUndefined()
    expect(result.store.size).toBe(2)
    // N-Triples has no prefixes
    expect(Object.keys(result.prefixes)).toHaveLength(0)
  })

  it('returns error for invalid N-Triples', async () => {
    const result = await parseNTriples('invalid data here')
    expect(result.error).toBeDefined()
  })
})

describe('parseJsonLd', () => {
  it('parses valid JSON-LD', async () => {
    const jsonld = JSON.stringify({
      '@context': { name: 'http://xmlns.com/foaf/0.1/name' },
      '@id': 'http://example.org/alice',
      name: 'Alice',
    })
    const result = await parseJsonLd(jsonld)
    expect(result.error).toBeUndefined()
    expect(result.store.size).toBeGreaterThan(0)
  })

  it('returns error for invalid JSON', async () => {
    const result = await parseJsonLd('not json')
    expect(result.error).toBeDefined()
  })
})

describe('parseAuto', () => {
  it('auto-detects Turtle format', async () => {
    const result = await parseAuto(VALID_TURTLE)
    expect(result.error).toBeUndefined()
    expect(result.store.size).toBe(3)
  })

  it('auto-detects JSON-LD by leading {', async () => {
    const jsonld = JSON.stringify({
      '@id': 'http://example.org/x',
      'http://xmlns.com/foaf/0.1/name': 'X',
    })
    const result = await parseAuto(jsonld)
    expect(result.error).toBeUndefined()
    expect(result.store.size).toBeGreaterThan(0)
  })

  it('uses hint for N-Triples', async () => {
    const result = await parseAuto(VALID_NTRIPLES, 'n-triples')
    expect(result.error).toBeUndefined()
    expect(result.store.size).toBe(2)
  })
})
