import { describe, it, expect } from 'vitest'
import { shorten, localName, prefixDeclarations } from '../namespaces'

describe('shorten', () => {
  it('shortens known namespace IRIs', () => {
    expect(shorten('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')).toBe('rdf:type')
    expect(shorten('http://xmlns.com/foaf/0.1/Person')).toBe('foaf:Person')
    expect(shorten('http://www.w3.org/2000/01/rdf-schema#label')).toBe('rdfs:label')
  })

  it('uses extra prefixes with priority', () => {
    const extra = { ex: 'http://example.org/' }
    expect(shorten('http://example.org/alice', extra)).toBe('ex:alice')
  })

  it('falls back to local name after # or /', () => {
    expect(shorten('http://unknown.org/vocab#Widget')).toBe('Widget')
    expect(shorten('http://unknown.org/vocab/Widget')).toBe('Widget')
  })

  it('returns original IRI when no # or / separator found', () => {
    // urn:uuid:12345 has ':' separators but no '#' or '/' after the scheme
    // shorten correctly returns the full IRI
    expect(shorten('urn:uuid:12345')).toBe('urn:uuid:12345')
  })
})

describe('localName', () => {
  it('extracts local name after #', () => {
    expect(localName('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')).toBe('type')
  })

  it('extracts local name after /', () => {
    expect(localName('http://xmlns.com/foaf/0.1/Person')).toBe('Person')
  })

  it('returns full IRI when no separator', () => {
    expect(localName('foobar')).toBe('foobar')
  })
})

describe('prefixDeclarations', () => {
  it('generates @prefix lines', () => {
    const decls = prefixDeclarations()
    expect(decls).toContain('@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .')
    expect(decls).toContain('@prefix foaf: <http://xmlns.com/foaf/0.1/> .')
  })

  it('includes extra prefixes', () => {
    const decls = prefixDeclarations({ ex: 'http://example.org/' })
    expect(decls).toContain('@prefix ex: <http://example.org/> .')
  })
})
