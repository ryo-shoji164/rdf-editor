import { describe, it, expect } from 'vitest'
import * as N3 from 'n3'
import { storeToCytoscape, TYPE_COLORS } from '../graphUtils'

const { namedNode, literal, quad } = N3.DataFactory

function createStore(quads: N3.Quad[]): N3.Store {
  const store = new N3.Store()
  store.addQuads(quads)
  return store
}

const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'

describe('storeToCytoscape', () => {
  it('should create nodes and edges from simple triples', () => {
    const store = createStore([
      quad(
        namedNode('http://example.org/Alice'),
        namedNode('http://xmlns.com/foaf/0.1/name'),
        literal('Alice')
      ),
    ])

    const result = storeToCytoscape(store, {})
    expect(result.nodes).toHaveLength(2)
    expect(result.edges).toHaveLength(1)
  })

  it('should attach rdfType and rdfTypes for nodes with rdf:type', () => {
    const store = createStore([
      quad(
        namedNode('http://example.org/Alice'),
        namedNode(RDF_TYPE),
        namedNode('http://xmlns.com/foaf/0.1/Person')
      ),
      quad(
        namedNode('http://example.org/Alice'),
        namedNode('http://xmlns.com/foaf/0.1/name'),
        literal('Alice')
      ),
    ])

    const result = storeToCytoscape(store, { foaf: 'http://xmlns.com/foaf/0.1/' })

    const aliceNode = result.nodes.find((n) => n.data.id === 'http://example.org/Alice')
    expect(aliceNode).toBeDefined()
    expect(aliceNode!.data.rdfType).toBe('Person')
    expect(aliceNode!.data.rdfTypes).toEqual(['http://xmlns.com/foaf/0.1/Person'])
  })

  it('should handle multiple rdf:type values', () => {
    const store = createStore([
      quad(
        namedNode('http://example.org/Bob'),
        namedNode(RDF_TYPE),
        namedNode('http://xmlns.com/foaf/0.1/Person')
      ),
      quad(
        namedNode('http://example.org/Bob'),
        namedNode(RDF_TYPE),
        namedNode('http://xmlns.com/foaf/0.1/Agent')
      ),
    ])

    const result = storeToCytoscape(store, {})

    const bobNode = result.nodes.find((n) => n.data.id === 'http://example.org/Bob')
    expect(bobNode).toBeDefined()
    expect(bobNode!.data.rdfTypes).toHaveLength(2)
    expect(bobNode!.data.rdfTypes).toContain('http://xmlns.com/foaf/0.1/Person')
    expect(bobNode!.data.rdfTypes).toContain('http://xmlns.com/foaf/0.1/Agent')
    // Primary type is the first one encountered
    expect(bobNode!.data.rdfType).toBe('Person')
  })

  it('should not attach rdfType to nodes without rdf:type', () => {
    const store = createStore([
      quad(namedNode('http://example.org/x'), namedNode('http://example.org/p'), literal('value')),
    ])

    const result = storeToCytoscape(store, {})

    const xNode = result.nodes.find((n) => n.data.id === 'http://example.org/x')
    expect(xNode).toBeDefined()
    expect(xNode!.data.rdfType).toBeUndefined()
    expect(xNode!.data.rdfTypes).toBeUndefined()
  })

  it('should not attach rdfType to literal or blank nodes', () => {
    const store = createStore([
      quad(namedNode('http://example.org/x'), namedNode('http://example.org/p'), literal('hello')),
    ])

    const result = storeToCytoscape(store, {})

    const litNode = result.nodes.find((n) => n.data.nodeType === 'literal')
    expect(litNode).toBeDefined()
    expect(litNode!.data.rdfType).toBeUndefined()
  })

  it('should handle owl:Class type correctly', () => {
    const store = createStore([
      quad(
        namedNode('http://example.org/MyClass'),
        namedNode(RDF_TYPE),
        namedNode('http://www.w3.org/2002/07/owl#Class')
      ),
    ])

    const result = storeToCytoscape(store, {})

    const node = result.nodes.find((n) => n.data.id === 'http://example.org/MyClass')
    expect(node).toBeDefined()
    expect(node!.data.rdfType).toBe('Class')
  })

  it('should shorten labels using prefixes', () => {
    const store = createStore([
      quad(
        namedNode('http://example.org/x'),
        namedNode('http://example.org/p'),
        namedNode('http://example.org/y')
      ),
    ])

    const result = storeToCytoscape(store, { ex: 'http://example.org/' })

    const xNode = result.nodes.find((n) => n.data.id === 'http://example.org/x')
    expect(xNode!.data.label).toBe('ex:x')
  })

  it('should handle blank nodes', () => {
    const store = createStore([
      quad(N3.DataFactory.blankNode('b0'), namedNode('http://example.org/p'), literal('value')),
    ])

    const result = storeToCytoscape(store, {})

    const blankNode = result.nodes.find((n) => n.data.nodeType === 'blank')
    expect(blankNode).toBeDefined()
    expect(blankNode!.data.label).toMatch(/^_:/)
  })

  it('should cap at MAX_NODES (300)', () => {
    const quads: N3.Quad[] = []
    for (let i = 0; i < 400; i++) {
      quads.push(
        quad(
          namedNode(`http://example.org/s${i}`),
          namedNode('http://example.org/p'),
          literal(`val${i}`)
        )
      )
    }
    const store = createStore(quads)

    const result = storeToCytoscape(store, {})
    // Each quad creates 2 nodes + 1 edge; capped at 300 quads
    expect(result.edges.length).toBeLessThanOrEqual(300)
  })
})

describe('TYPE_COLORS', () => {
  it('should have entries for common RDF types', () => {
    expect(TYPE_COLORS).toHaveProperty('Class')
    expect(TYPE_COLORS).toHaveProperty('Person')
    expect(TYPE_COLORS).toHaveProperty('Ontology')
  })

  it('should have bg and border colors for each entry', () => {
    for (const [, colors] of Object.entries(TYPE_COLORS)) {
      expect(colors.bg).toMatch(/^#[0-9a-f]{6}$/)
      expect(colors.border).toMatch(/^#[0-9a-f]{6}$/)
      expect(colors.label).toBeTruthy()
    }
  })
})
