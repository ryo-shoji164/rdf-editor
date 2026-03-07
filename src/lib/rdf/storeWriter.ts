/**
 * Store Writer – write operations for N3.Store
 *
 * Provides add / remove / update triple operations, enabling the
 * reverse data flow:  Graph/Table UI → Store → serialize → Editor.
 *
 * All functions are pure (operate on a provided store) and return
 * a boolean indicating whether a change was actually made.
 */
import * as N3 from 'n3'
import type { Triple } from '../../types/rdf'

const { namedNode, literal, blankNode, quad: makeQuad } = N3.DataFactory

// ─── Helpers ──────────────────────────────────────────────────────

/**
 * Convert a Triple's object into an N3 Term based on objectType.
 */
function objectToTerm(
    value: string,
    objectType: Triple['objectType'],
    datatype?: string,
    language?: string
): N3.NamedNode | N3.BlankNode | N3.Literal {
    if (objectType === 'blank') {
        return blankNode(value.startsWith('_:') ? value.slice(2) : value)
    }
    if (objectType === 'literal') {
        if (language) {
            return literal(value, language)
        }
        if (datatype && datatype !== 'http://www.w3.org/2001/XMLSchema#string') {
            return literal(value, namedNode(datatype))
        }
        return literal(value)
    }
    return namedNode(value)
}

/**
 * Convert a Triple into an N3.Quad.
 */
export function tripleToQuad(triple: Triple): N3.Quad {
    const subject = triple.subject.startsWith('_:')
        ? blankNode(triple.subject.slice(2))
        : namedNode(triple.subject)
    const predicate = namedNode(triple.predicate)
    const object = objectToTerm(triple.object, triple.objectType, triple.datatype, triple.language)

    return makeQuad(subject, predicate, object)
}

// ─── Write operations ─────────────────────────────────────────────

/**
 * Add a triple to the store.
 * Returns true if the triple was newly added (not already present).
 */
export function addTriple(store: N3.Store, triple: Triple): boolean {
    const q = tripleToQuad(triple)
    const sizeBefore = store.size
    store.add(q)
    return store.size > sizeBefore
}

/**
 * Remove a triple from the store.
 * Returns true if a triple was actually removed.
 */
export function removeTriple(store: N3.Store, triple: Triple): boolean {
    const q = tripleToQuad(triple)
    const sizeBefore = store.size
    store.delete(q)
    return store.size < sizeBefore
}

/**
 * Update a triple: remove the old one and add the new one.
 * Returns true if the update resulted in a change.
 */
export function updateTriple(
    store: N3.Store,
    oldTriple: Triple,
    newTriple: Triple
): boolean {
    const removed = removeTriple(store, oldTriple)
    const added = addTriple(store, newTriple)
    return removed || added
}

/**
 * Add multiple triples at once.
 * Returns the number of newly added triples.
 */
export function addTriples(store: N3.Store, triples: Triple[]): number {
    let count = 0
    for (const t of triples) {
        if (addTriple(store, t)) count++
    }
    return count
}

/**
 * Remove multiple triples at once.
 * Returns the number of actually removed triples.
 */
export function removeTriples(store: N3.Store, triples: Triple[]): number {
    let count = 0
    for (const t of triples) {
        if (removeTriple(store, t)) count++
    }
    return count
}

/**
 * Remove all triples with the given subject.
 * Returns the number of removed triples.
 */
export function removeSubject(store: N3.Store, subjectIri: string): number {
    const subjectNode = namedNode(subjectIri)
    const quads = store.getQuads(subjectNode, null, null, null)
    let count = 0
    for (const q of quads) {
        store.delete(q)
        count++
    }
    return count
}
