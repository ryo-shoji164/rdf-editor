// RDF format types
export type RdfFormat = 'turtle' | 'n-triples' | 'n-quads' | 'jsonld'

// Simple triple representation
export interface Triple {
  subject: string
  predicate: string
  object: string
  objectType: 'iri' | 'literal' | 'blank'
  datatype?: string
  language?: string
}

// SAMM model types
export interface SammAspect {
  iri: string
  name: string
  preferredName?: string
  description?: string
  properties: SammProperty[]
  operations: SammOperation[]
  events: SammEvent[]
}

export interface SammProperty {
  iri: string
  name: string
  preferredName?: string
  description?: string
  characteristic?: SammCharacteristic
  exampleValue?: string
  optional?: boolean
}

export type SammCharacteristicType =
  | 'Characteristic'
  | 'SingleEntity'
  | 'Collection'
  | 'Set'
  | 'SortedSet'
  | 'List'
  | 'TimeSeries'
  | 'Enumeration'
  | 'State'
  | 'Duration'
  | 'Measurement'
  | 'Quantifiable'
  | 'Code'
  | 'Either'
  | 'StructuredValue'

export interface SammCharacteristic {
  iri: string
  name: string
  type: SammCharacteristicType
  preferredName?: string
  description?: string
  dataType?: string
  unit?: string
  values?: string[] // for Enumeration/State
  baseCharacteristic?: string // for Either
}

export interface SammEntity {
  iri: string
  name: string
  preferredName?: string
  description?: string
  properties: SammProperty[]
  extends?: string
}

export interface SammOperation {
  iri: string
  name: string
  preferredName?: string
  description?: string
  input?: SammProperty[]
  output?: SammProperty
}

export interface SammEvent {
  iri: string
  name: string
  preferredName?: string
  description?: string
  parameters?: SammProperty[]
}

// Cytoscape element data types
export interface CyNodeData {
  id: string
  label: string
  nodeType: 'iri' | 'literal' | 'blank'
  fullIri?: string
}

export interface CyEdgeData {
  id: string
  source: string
  target: string
  label: string
  fullIri?: string
}
