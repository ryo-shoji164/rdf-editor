import { describe, it, expect } from 'vitest'
import * as N3 from 'n3'
import { validateShacl } from '../shaclValidator'

const DATA_TURTLE = `
@prefix ex: <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:Alice a ex:Person ;
  ex:name "Alice" ;
  ex:age "30"^^xsd:integer .

ex:Bob a ex:Person ;
  ex:name "Bob" ;
  ex:age "25"^^xsd:integer .
`

const SHAPES_REQUIRED_NAME = `
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ex: <http://example.org/> .

ex:PersonShape
  a sh:NodeShape ;
  sh:targetClass ex:Person ;
  sh:property [
    sh:path ex:name ;
    sh:minCount 1 ;
    sh:message "Each Person must have a name." ;
  ] .
`

const SHAPES_DATATYPE = `
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ex: <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:PersonShape
  a sh:NodeShape ;
  sh:targetClass ex:Person ;
  sh:property [
    sh:path ex:age ;
    sh:datatype xsd:integer ;
  ] .
`

async function buildStore(turtle: string): Promise<N3.Store> {
  return new Promise((resolve, reject) => {
    const store = new N3.Store()
    const parser = new N3.Parser({ format: 'Turtle' })
    parser.parse(turtle, (err, quad) => {
      if (err) {
        reject(err)
        return
      }
      if (quad) {
        store.add(quad)
      } else {
        resolve(store)
      }
    })
  })
}

describe('validateShacl', () => {
  it('returns conforms=true when data satisfies all shapes', async () => {
    const store = await buildStore(DATA_TURTLE)
    const report = await validateShacl(store, SHAPES_REQUIRED_NAME, DATA_TURTLE)
    expect(report.conforms).toBe(true)
    expect(report.results).toHaveLength(0)
    expect(report.violatingNodes).toHaveLength(0)
  })

  it('reports a violation when a required property is missing', async () => {
    const dataMissingName = `
      @prefix ex: <http://example.org/> .
      ex:Bob a ex:Person .
    `
    const store = await buildStore(dataMissingName)
    const report = await validateShacl(store, SHAPES_REQUIRED_NAME, dataMissingName)

    expect(report.conforms).toBe(false)
    expect(report.results.length).toBeGreaterThan(0)
    const result = report.results[0]
    expect(result.severity).toBe('error')
    expect(result.focusNode).toBe('http://example.org/Bob')
    expect(report.violatingNodes).toContain('http://example.org/Bob')
  })

  it('includes the violation message from the shape', async () => {
    const dataMissingName = `
      @prefix ex: <http://example.org/> .
      ex:Carol a ex:Person .
    `
    const store = await buildStore(dataMissingName)
    const report = await validateShacl(store, SHAPES_REQUIRED_NAME, dataMissingName)

    expect(report.results[0].message).toBe('Each Person must have a name.')
  })

  it('returns conforms=true with datatype shapes when data is correct', async () => {
    const store = await buildStore(DATA_TURTLE)
    const report = await validateShacl(store, SHAPES_DATATYPE, DATA_TURTLE)
    expect(report.conforms).toBe(true)
  })

  it('returns empty results when shapes text is empty', async () => {
    const store = await buildStore(DATA_TURTLE)
    const report = await validateShacl(store, '', DATA_TURTLE)
    expect(report.conforms).toBe(true)
    expect(report.results).toHaveLength(0)
  })

  it('throws on invalid shapes Turtle', async () => {
    const store = await buildStore(DATA_TURTLE)
    await expect(validateShacl(store, 'not valid turtle !!!', DATA_TURTLE)).rejects.toThrow(
      /Invalid SHACL shapes/
    )
  })

  it('deduplicates violatingNodes', async () => {
    // Both Alice and Bob have no name property
    const dataBothMissing = `
      @prefix ex: <http://example.org/> .
      ex:Alice a ex:Person .
      ex:Bob a ex:Person .
    `
    const store = await buildStore(dataBothMissing)
    const report = await validateShacl(store, SHAPES_REQUIRED_NAME, dataBothMissing)

    expect(report.violatingNodes.length).toBe(new Set(report.violatingNodes).size)
    expect(report.violatingNodes).toContain('http://example.org/Alice')
    expect(report.violatingNodes).toContain('http://example.org/Bob')
  })
})
