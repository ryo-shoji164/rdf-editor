export interface PrefixItem {
  prefix: string
  uri: string
  description?: string
}

export const COMMON_PREFIXES: PrefixItem[] = [
  {
    prefix: 'rdf',
    uri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    description: 'The RDF Concepts Vocabulary',
  },
  {
    prefix: 'rdfs',
    uri: 'http://www.w3.org/2000/01/rdf-schema#',
    description: 'The RDF Schema Vocabulary',
  },
  {
    prefix: 'owl',
    uri: 'http://www.w3.org/2002/07/owl#',
    description: 'The OWL 2 Schema vocabulary',
  },
  { prefix: 'xsd', uri: 'http://www.w3.org/2001/XMLSchema#', description: 'XML Schema Datatypes' },
  { prefix: 'schema', uri: 'http://schema.org/', description: 'Schema.org vocabulary' },
  {
    prefix: 'foaf',
    uri: 'http://xmlns.com/foaf/0.1/',
    description: 'Friend of a Friend (FOAF) vocabulary',
  },
  {
    prefix: 'dc',
    uri: 'http://purl.org/dc/elements/1.1/',
    description: 'Dublin Core Metadata Element Set',
  },
  { prefix: 'dcterms', uri: 'http://purl.org/dc/terms/', description: 'DCMI Metadata Terms' },
  {
    prefix: 'skos',
    uri: 'http://www.w3.org/2004/02/skos/core#',
    description: 'Simple Knowledge Organization System',
  },
]
