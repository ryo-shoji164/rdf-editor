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

const mm = (local: string) => `${SAMM_NS}${local}`
const c = (local: string) => `${SAMM_C_NS}${local}`

// Meta-model classes
export const SAMM = {
  Aspect: mm('Aspect'),
  Property: mm('Property'),
  Characteristic: mm('Characteristic'),
  Entity: mm('Entity'),
  Operation: mm('Operation'),
  Event: mm('Event'),
  AbstractEntity: mm('AbstractEntity'),
  AbstractProperty: mm('AbstractProperty'),
  Constraint: mm('Constraint'),
  Unit: mm('Unit'),
  Quantity: mm('Quantity'),
} as const

// Meta-model properties
export const SAMM_PROP = {
  name: mm('name'),
  preferredName: mm('preferredName'),
  description: mm('description'),
  see: mm('see'),
  exampleValue: mm('exampleValue'),
  properties: mm('properties'),
  operations: mm('operations'),
  events: mm('events'),
  characteristic: mm('characteristic'),
  input: mm('input'),
  output: mm('output'),
  parameters: mm('parameters'),
  dataType: mm('dataType'),
  optional: mm('optional'),
  notInPayload: mm('notInPayload'),
  payloadName: mm('payloadName'),
  extends: mm('extends'),
} as const

// Built-in characteristics (samm-c namespace)
export const SAMM_C = {
  // Simple
  Text: c('Text'),
  Boolean: c('Boolean'),
  Timestamp: c('Timestamp'),
  Language: c('Language'),
  Locale: c('Locale'),
  MimeType: c('MimeType'),
  ResourcePath: c('ResourcePath'),
  UnitReference: c('UnitReference'),

  // Quantifiable / Measurement
  Quantifiable: c('Quantifiable'),
  Measurement: c('Measurement'),
  Duration: c('Duration'),

  // Code
  Code: c('Code'),

  // Collection types
  Collection: c('Collection'),
  Set: c('Set'),
  SortedSet: c('SortedSet'),
  List: c('List'),
  TimeSeries: c('TimeSeries'),

  // Structured
  SingleEntity: c('SingleEntity'),
  Enumeration: c('Enumeration'),
  State: c('State'),
  Either: c('Either'),
  StructuredValue: c('StructuredValue'),

  // Properties on characteristics
  unit: c('unit'),
  baseCharacteristic: c('baseCharacteristic'),
  left: c('left'),
  right: c('right'),
  values: c('values'),
  defaultValue: c('defaultValue'),
  deconstructionRule: c('deconstructionRule'),
  elements: c('elements'),
  baseUnit: c('baseUnit'),
  quantityKind: c('quantityKind'),
  conversionFactor: c('conversionFactor'),
  numericConversionFactor: c('numericConversionFactor'),
  referenceUnit: c('referenceUnit'),
  commonCode: c('commonCode'),
  symbol: c('symbol'),
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
