import { SAMM_NS, SAMM_C_NS, SAMM_C, XSD } from './vocabulary'

/**
 * Generate a minimal Turtle template for a new SAMM Aspect Model.
 */
export function newAspectTemplate(name: string, namespace: string): string {
  const ns = namespace.endsWith('#') ? namespace : `${namespace}#`
  return `@prefix samm: <${SAMM_NS}> .
@prefix samm-c: <${SAMM_C_NS}> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <${ns}> .

:${name} a samm:Aspect ;
    samm:preferredName "${name}"@en ;
    samm:description "Description of ${name}."@en ;
    samm:properties ( ) ;
    samm:operations ( ) .
`
}

/**
 * Generate Turtle snippet to add a Property with a Text Characteristic.
 */
export function newPropertySnippet(
  propName: string,
  namespace: string,
  characteristicIri: string = SAMM_C.Text
): string {
  const ns = namespace.endsWith('#') ? namespace : `${namespace}#`
  return `
:${propName} a samm:Property ;
    samm:preferredName "${propName}"@en ;
    samm:characteristic ${formatIriRef(characteristicIri, ns)} .
`
}

/**
 * Generate Turtle snippet for a custom Characteristic.
 */
export function newCharacteristicSnippet(
  name: string,
  namespace: string,
  dataType: string = XSD.string,
  type: string = 'samm:Characteristic'
): string {
  const ns = namespace.endsWith('#') ? namespace : `${namespace}#`
  return `
:${name} a ${type} ;
    samm:preferredName "${name}"@en ;
    samm:dataType ${formatIriRef(dataType, ns)} .
`
}

/**
 * Generate Turtle snippet for a custom Entity.
 */
export function newEntitySnippet(name: string, namespace: string): string {
  const ns = namespace.endsWith('#') ? namespace : `${namespace}#`
  return `
:${name} a samm:Entity ;
    samm:preferredName "${name}"@en ;
    samm:properties ( ) .
`
}

/**
 * Format an IRI as a Turtle term: prefix:local or <full>
 */
function formatIriRef(iri: string, baseNs: string): string {
  if (iri.startsWith(baseNs)) {
    return `:${iri.slice(baseNs.length)}`
  }
  if (iri.startsWith(SAMM_NS)) {
    return `samm:${iri.slice(SAMM_NS.length)}`
  }
  if (iri.startsWith(SAMM_C_NS)) {
    return `samm-c:${iri.slice(SAMM_C_NS.length)}`
  }
  if (iri.startsWith('http://www.w3.org/2001/XMLSchema#')) {
    return `xsd:${iri.slice('http://www.w3.org/2001/XMLSchema#'.length)}`
  }
  return `<${iri}>`
}

/**
 * Minimal SAMM model example for demonstration.
 */
export const SAMM_EXAMPLE = `@prefix samm: <${SAMM_NS}> .
@prefix samm-c: <${SAMM_C_NS}> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:com.example:1.0.0#> .

:MyAspect a samm:Aspect ;
    samm:preferredName "My Aspect"@en ;
    samm:description "A sample SAMM Aspect Model."@en ;
    samm:properties ( :temperature :active ) ;
    samm:operations ( ) .

:temperature a samm:Property ;
    samm:preferredName "Temperature"@en ;
    samm:description "Current temperature in Celsius."@en ;
    samm:characteristic :TemperatureCharacteristic .

:active a samm:Property ;
    samm:preferredName "Active"@en ;
    samm:description "Whether the device is active."@en ;
    samm:characteristic samm-c:Boolean .

:TemperatureCharacteristic a samm-c:Measurement ;
    samm:preferredName "Temperature"@en ;
    samm:dataType xsd:float ;
    samm-c:unit <urn:samm:org.eclipse.esmf.samm:unit:2.2.0#degreeCelsius> .
`

/**
 * FOAF sample graph for free-mode demonstration.
 */
export const FOAF_EXAMPLE = `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<http://example.org/alice> a foaf:Person ;
    foaf:name "Alice" ;
    foaf:age 30 ;
    foaf:knows <http://example.org/bob> ;
    foaf:knows <http://example.org/carol> .

<http://example.org/bob> a foaf:Person ;
    foaf:name "Bob" ;
    foaf:age 25 ;
    foaf:homepage <http://bob.example.org/> .

<http://example.org/carol> a foaf:Person ;
    foaf:name "Carol" ;
    foaf:mbox <mailto:carol@example.org> .
`
