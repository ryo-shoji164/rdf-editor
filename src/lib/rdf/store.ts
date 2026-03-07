import * as N3 from 'n3'
import type { Triple } from '../../types/rdf'
import { shorten } from './namespaces'

/**
 * Extract all triples from an N3.Store as plain objects.
 */
export function storeToTriples(
  store: N3.Store,
  prefixes?: Record<string, string>
): Triple[] {
  const triples: Triple[] = []
  for (const quad of store) {
    const obj = quad.object
    let objectType: Triple['objectType'] = 'iri'
    let datatype: string | undefined
    let language: string | undefined

    if (obj.termType === 'Literal') {
      objectType = 'literal'
      datatype = obj.datatype?.value
      language = obj.language || undefined
    } else if (obj.termType === 'BlankNode') {
      objectType = 'blank'
    }

    triples.push({
      subject: quad.subject.value,
      predicate: quad.predicate.value,
      object: obj.value,
      objectType,
      datatype,
      language,
    })
  }
  return triples
}

/**
 * Get all unique subjects in the store.
 */
export function getSubjects(store: N3.Store): string[] {
  const seen = new Set<string>()
  for (const quad of store) {
    seen.add(quad.subject.value)
  }
  return Array.from(seen)
}

/**
 * Get all triples where subject = iri.
 */
export function getTriplesForSubject(
  store: N3.Store,
  iri: string
): Triple[] {
  const results: Triple[] = []
  const subject = N3.DataFactory.namedNode(iri)
  for (const quad of store.match(subject, null, null)) {
    const obj = quad.object
    let objectType: Triple['objectType'] = 'iri'
    let datatype: string | undefined
    let language: string | undefined
    if (obj.termType === 'Literal') {
      objectType = 'literal'
      datatype = obj.datatype?.value
      language = obj.language || undefined
    } else if (obj.termType === 'BlankNode') {
      objectType = 'blank'
    }
    results.push({
      subject: quad.subject.value,
      predicate: quad.predicate.value,
      object: obj.value,
      objectType,
      datatype,
      language,
    })
  }
  return results
}

/**
 * Get the value of a single predicate for a subject (first match).
 */
export function getOne(
  store: N3.Store,
  subject: string,
  predicate: string
): string | undefined {
  const s = N3.DataFactory.namedNode(subject)
  const p = N3.DataFactory.namedNode(predicate)
  for (const quad of store.match(s, p, null)) {
    return quad.object.value
  }
  return undefined
}

/**
 * Get all values for a predicate on a subject.
 */
export function getAll(
  store: N3.Store,
  subject: string,
  predicate: string
): string[] {
  const s = N3.DataFactory.namedNode(subject)
  const p = N3.DataFactory.namedNode(predicate)
  const results: string[] = []
  for (const quad of store.match(s, p, null)) {
    results.push(quad.object.value)
  }
  return results
}

/**
 * Resolve an RDF list (rdf:first / rdf:rest) starting from a node IRI.
 */
export function resolveRdfList(store: N3.Store, listNode: string): string[] {
  const RDF_FIRST = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first'
  const RDF_REST = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'
  const RDF_NIL = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'

  const items: string[] = []
  let current = listNode

  while (current && current !== RDF_NIL) {
    const first = getOne(store, current, RDF_FIRST)
    if (first) items.push(first)
    current = getOne(store, current, RDF_REST) ?? RDF_NIL
  }

  return items
}

/**
 * Get a display label for a node using rdfs:label or localname.
 */
export function getLabel(
  store: N3.Store,
  iri: string,
  prefixes?: Record<string, string>
): string {
  const label = getOne(store, iri, 'http://www.w3.org/2000/01/rdf-schema#label')
  if (label) return label
  return shorten(iri, prefixes)
}
