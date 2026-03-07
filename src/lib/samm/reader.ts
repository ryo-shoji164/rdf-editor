import * as N3 from 'n3'
import type {
  SammAspect,
  SammProperty,
  SammCharacteristic,
  SammEntity,
  SammCharacteristicType,
} from '../../types/rdf'
import { SAMM, SAMM_PROP, SAMM_C, SAMM_C_NS, SAMM_NS } from './vocabulary'
import { getOne, getAll, resolveRdfList } from '../rdf/store'

const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'

/**
 * Find all Aspect IRIs in the store.
 */
export function findAspects(store: N3.Store): string[] {
  const aspectType = N3.DataFactory.namedNode(SAMM.Aspect)
  const rdfType = N3.DataFactory.namedNode(RDF_TYPE)
  const results: string[] = []
  for (const quad of store.match(null, rdfType, aspectType)) {
    results.push(quad.subject.value)
  }
  return results
}

/**
 * Find all Entity IRIs in the store.
 */
export function findEntities(store: N3.Store): string[] {
  const type = N3.DataFactory.namedNode(SAMM.Entity)
  const rdfType = N3.DataFactory.namedNode(RDF_TYPE)
  const results: string[] = []
  for (const quad of store.match(null, rdfType, type)) {
    results.push(quad.subject.value)
  }
  return results
}

/**
 * Read a SammAspect from the store.
 */
export function readAspect(store: N3.Store, aspectIri: string): SammAspect {
  const propsListNode = getOne(store, aspectIri, SAMM_PROP.properties)
  const propsIris = propsListNode ? resolveRdfList(store, propsListNode) : []
  const properties = propsIris.map((iri) => readProperty(store, iri))

  const opsListNode = getOne(store, aspectIri, SAMM_PROP.operations)
  const opsIris = opsListNode ? resolveRdfList(store, opsListNode) : []

  const eventsListNode = getOne(store, aspectIri, SAMM_PROP.events)
  const eventsIris = eventsListNode ? resolveRdfList(store, eventsListNode) : []

  return {
    iri: aspectIri,
    name: localName(aspectIri),
    preferredName: getOne(store, aspectIri, SAMM_PROP.preferredName),
    description: getOne(store, aspectIri, SAMM_PROP.description),
    properties,
    operations: opsIris.map((iri) => ({ iri, name: localName(iri) })),
    events: eventsIris.map((iri) => ({ iri, name: localName(iri) })),
  }
}

/**
 * Read a SammProperty from the store.
 */
export function readProperty(store: N3.Store, propIri: string): SammProperty {
  const charIri = getOne(store, propIri, SAMM_PROP.characteristic)
  const characteristic = charIri ? readCharacteristic(store, charIri) : undefined
  const optionalVal = getOne(store, propIri, SAMM_PROP.optional)

  return {
    iri: propIri,
    name: localName(propIri),
    preferredName: getOne(store, propIri, SAMM_PROP.preferredName),
    description: getOne(store, propIri, SAMM_PROP.description),
    characteristic,
    exampleValue: getOne(store, propIri, SAMM_PROP.exampleValue),
    optional: optionalVal === 'true',
  }
}

/**
 * Read a SammCharacteristic from the store.
 */
export function readCharacteristic(
  store: N3.Store,
  charIri: string
): SammCharacteristic {
  // Check if it's a built-in characteristic
  if (charIri.startsWith(SAMM_C_NS)) {
    return {
      iri: charIri,
      name: charIri.slice(SAMM_C_NS.length),
      type: 'Characteristic',
      preferredName: charIri.slice(SAMM_C_NS.length),
    }
  }

  const type = resolveCharacteristicType(store, charIri)
  const dataType = getOne(store, charIri, SAMM_PROP.dataType)
  const unit = getOne(store, charIri, SAMM_C.unit)

  // For enumerations / states, read values
  const valuesNode = getOne(store, charIri, SAMM_C.values)
  const values = valuesNode ? resolveRdfList(store, valuesNode) : undefined

  return {
    iri: charIri,
    name: localName(charIri),
    type,
    preferredName: getOne(store, charIri, SAMM_PROP.preferredName),
    description: getOne(store, charIri, SAMM_PROP.description),
    dataType,
    unit,
    values,
  }
}

/**
 * Read a SammEntity from the store.
 */
export function readEntity(store: N3.Store, entityIri: string): SammEntity {
  const propsListNode = getOne(store, entityIri, SAMM_PROP.properties)
  const propsIris = propsListNode ? resolveRdfList(store, propsListNode) : []
  const properties = propsIris.map((iri) => readProperty(store, iri))
  const extendsIri = getOne(store, entityIri, SAMM_PROP.extends)

  return {
    iri: entityIri,
    name: localName(entityIri),
    preferredName: getOne(store, entityIri, SAMM_PROP.preferredName),
    description: getOne(store, entityIri, SAMM_PROP.description),
    properties,
    extends: extendsIri,
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function localName(iri: string): string {
  const hash = iri.lastIndexOf('#')
  const slash = iri.lastIndexOf('/')
  const sep = Math.max(hash, slash)
  return sep >= 0 ? iri.slice(sep + 1) : iri
}

const CHAR_TYPE_MAP: Record<string, SammCharacteristicType> = {
  [SAMM_C.SingleEntity]: 'SingleEntity',
  [SAMM_C.Collection]: 'Collection',
  [SAMM_C.Set]: 'Set',
  [SAMM_C.SortedSet]: 'SortedSet',
  [SAMM_C.List]: 'List',
  [SAMM_C.TimeSeries]: 'TimeSeries',
  [SAMM_C.Enumeration]: 'Enumeration',
  [SAMM_C.State]: 'State',
  [SAMM_C.Duration]: 'Duration',
  [SAMM_C.Measurement]: 'Measurement',
  [SAMM_C.Quantifiable]: 'Quantifiable',
  [SAMM_C.Code]: 'Code',
  [SAMM_C.Either]: 'Either',
  [SAMM_C.StructuredValue]: 'StructuredValue',
  [SAMM.Characteristic]: 'Characteristic',
}

function resolveCharacteristicType(
  store: N3.Store,
  iri: string
): SammCharacteristicType {
  const types = getAll(store, iri, RDF_TYPE)
  for (const t of types) {
    if (CHAR_TYPE_MAP[t]) return CHAR_TYPE_MAP[t]
  }
  return 'Characteristic'
}
