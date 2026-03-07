// SAMM 2.2.0 vocabulary constants
const BASE = 'urn:samm:org.eclipse.esmf.samm:'
const MM_VER = 'meta-model:2.2.0#'
const C_VER = 'characteristic:2.2.0#'
const E_VER = 'entity:2.2.0#'
const U_VER = 'unit:2.2.0#'

export const SAMM_NS = `${BASE}${MM_VER}`
export const SAMM_C_NS = `${BASE}${C_VER}`
export const SAMM_E_NS = `${BASE}${E_VER}`
export const UNIT_NS = `${BASE}${U_VER}`

const sammTerm = (local: string) => `${SAMM_NS}${local}`
const sammCharTerm = (local: string) => `${SAMM_C_NS}${local}`

// Meta-model classes
export const SAMM = {
  Aspect: sammTerm('Aspect'),
  Property: sammTerm('Property'),
  Characteristic: sammTerm('Characteristic'),
  Entity: sammTerm('Entity'),
  Operation: sammTerm('Operation'),
  Event: sammTerm('Event'),
  AbstractEntity: sammTerm('AbstractEntity'),
  AbstractProperty: sammTerm('AbstractProperty'),
  Constraint: sammTerm('Constraint'),
  Unit: sammTerm('Unit'),
  Quantity: sammTerm('Quantity'),
} as const

// Meta-model properties
export const SAMM_PROP = {
  name: sammTerm('name'),
  preferredName: sammTerm('preferredName'),
  description: sammTerm('description'),
  see: sammTerm('see'),
  exampleValue: sammTerm('exampleValue'),
  properties: sammTerm('properties'),
  operations: sammTerm('operations'),
  events: sammTerm('events'),
  characteristic: sammTerm('characteristic'),
  input: sammTerm('input'),
  output: sammTerm('output'),
  parameters: sammTerm('parameters'),
  dataType: sammTerm('dataType'),
  optional: sammTerm('optional'),
  notInPayload: sammTerm('notInPayload'),
  payloadName: sammTerm('payloadName'),
  extends: sammTerm('extends'),
} as const

// Built-in characteristics (samm-c namespace)
export const SAMM_C = {
  // Simple
  Text: sammCharTerm('Text'),
  Boolean: sammCharTerm('Boolean'),
  Timestamp: sammCharTerm('Timestamp'),
  Language: sammCharTerm('Language'),
  Locale: sammCharTerm('Locale'),
  MimeType: sammCharTerm('MimeType'),
  ResourcePath: sammCharTerm('ResourcePath'),
  UnitReference: sammCharTerm('UnitReference'),

  // Quantifiable / Measurement
  Quantifiable: sammCharTerm('Quantifiable'),
  Measurement: sammCharTerm('Measurement'),
  Duration: sammCharTerm('Duration'),

  // Code
  Code: sammCharTerm('Code'),

  // Collection types
  Collection: sammCharTerm('Collection'),
  Set: sammCharTerm('Set'),
  SortedSet: sammCharTerm('SortedSet'),
  List: sammCharTerm('List'),
  TimeSeries: sammCharTerm('TimeSeries'),

  // Structured
  SingleEntity: sammCharTerm('SingleEntity'),
  Enumeration: sammCharTerm('Enumeration'),
  State: sammCharTerm('State'),
  Either: sammCharTerm('Either'),
  StructuredValue: sammCharTerm('StructuredValue'),

  // Properties on characteristics
  unit: sammCharTerm('unit'),
  baseCharacteristic: sammCharTerm('baseCharacteristic'),
  left: sammCharTerm('left'),
  right: sammCharTerm('right'),
  values: sammCharTerm('values'),
  defaultValue: sammCharTerm('defaultValue'),
  deconstructionRule: sammCharTerm('deconstructionRule'),
  elements: sammCharTerm('elements'),
  baseUnit: sammCharTerm('baseUnit'),
  quantityKind: sammCharTerm('quantityKind'),
  conversionFactor: sammCharTerm('conversionFactor'),
  numericConversionFactor: sammCharTerm('numericConversionFactor'),
  referenceUnit: sammCharTerm('referenceUnit'),
  commonCode: sammCharTerm('commonCode'),
  symbol: sammCharTerm('symbol'),
} as const

// Well-known XSD types used in SAMM models
export const XSD = {
  string: 'http://www.w3.org/2001/XMLSchema#string',
  boolean: 'http://www.w3.org/2001/XMLSchema#boolean',
  decimal: 'http://www.w3.org/2001/XMLSchema#decimal',
  integer: 'http://www.w3.org/2001/XMLSchema#integer',
  float: 'http://www.w3.org/2001/XMLSchema#float',
  double: 'http://www.w3.org/2001/XMLSchema#double',
  date: 'http://www.w3.org/2001/XMLSchema#date',
  dateTime: 'http://www.w3.org/2001/XMLSchema#dateTime',
  time: 'http://www.w3.org/2001/XMLSchema#time',
  anyURI: 'http://www.w3.org/2001/XMLSchema#anyURI',
  int: 'http://www.w3.org/2001/XMLSchema#int',
  long: 'http://www.w3.org/2001/XMLSchema#long',
  short: 'http://www.w3.org/2001/XMLSchema#short',
  byte: 'http://www.w3.org/2001/XMLSchema#byte',
  unsignedInt: 'http://www.w3.org/2001/XMLSchema#unsignedInt',
  unsignedLong: 'http://www.w3.org/2001/XMLSchema#unsignedLong',
  unsignedShort: 'http://www.w3.org/2001/XMLSchema#unsignedShort',
  unsignedByte: 'http://www.w3.org/2001/XMLSchema#unsignedByte',
  positiveInteger: 'http://www.w3.org/2001/XMLSchema#positiveInteger',
  nonNegativeInteger: 'http://www.w3.org/2001/XMLSchema#nonNegativeInteger',
  negativeInteger: 'http://www.w3.org/2001/XMLSchema#negativeInteger',
  nonPositiveInteger: 'http://www.w3.org/2001/XMLSchema#nonPositiveInteger',
  base64Binary: 'http://www.w3.org/2001/XMLSchema#base64Binary',
  hexBinary: 'http://www.w3.org/2001/XMLSchema#hexBinary',
} as const

export type XsdType = keyof typeof XSD

/** List of XSD types suitable as Characteristic dataType */
export const XSD_TYPES: XsdType[] = [
  'string', 'boolean', 'decimal', 'integer', 'float', 'double',
  'date', 'dateTime', 'time', 'anyURI',
  'int', 'long', 'short', 'byte',
  'unsignedInt', 'unsignedLong', 'unsignedShort', 'unsignedByte',
  'positiveInteger', 'nonNegativeInteger',
  'base64Binary', 'hexBinary',
]
