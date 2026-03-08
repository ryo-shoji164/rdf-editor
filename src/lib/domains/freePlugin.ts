/**
 * Free (FOAF) Domain Plugin
 *
 * The default domain with no constraints. Provides a FOAF example template
 * and common RDF/RDFS/OWL vocabulary for auto-completion.
 */
import type { DomainPlugin, VocabularyItem } from '../../types/domain'
import { FOAF_EXAMPLE } from '../samm/templates'

// ─── Common RDF vocabulary for code completion ────────────────────

const RDF_VOCABULARY: VocabularyItem[] = [
  // RDF classes
  {
    iri: 'http://www.w3.org/2000/01/rdf-schema#Class',
    prefixedName: 'rdfs:Class',
    label: 'Class',
    kind: 'class',
    description: 'The class of classes',
    position: 'object',
  },
  {
    iri: 'http://www.w3.org/2000/01/rdf-schema#Resource',
    prefixedName: 'rdfs:Resource',
    label: 'Resource',
    kind: 'class',
    description: 'The class of everything',
    position: 'object',
  },
  {
    iri: 'http://www.w3.org/2002/07/owl#Class',
    prefixedName: 'owl:Class',
    label: 'owl:Class',
    kind: 'class',
    description: 'An OWL class',
    position: 'object',
  },
  {
    iri: 'http://www.w3.org/2002/07/owl#Ontology',
    prefixedName: 'owl:Ontology',
    label: 'owl:Ontology',
    kind: 'class',
    description: 'An OWL ontology',
    position: 'object',
  },

  // Common properties
  {
    iri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    prefixedName: 'rdf:type',
    label: 'type',
    kind: 'property',
    description: 'The class of a resource',
    position: 'predicate',
  },
  {
    iri: 'http://www.w3.org/2000/01/rdf-schema#label',
    prefixedName: 'rdfs:label',
    label: 'label',
    kind: 'property',
    description: 'Human-readable name',
    position: 'predicate',
  },
  {
    iri: 'http://www.w3.org/2000/01/rdf-schema#comment',
    prefixedName: 'rdfs:comment',
    label: 'comment',
    kind: 'property',
    description: 'Human-readable description',
    position: 'predicate',
  },
  {
    iri: 'http://www.w3.org/2000/01/rdf-schema#subClassOf',
    prefixedName: 'rdfs:subClassOf',
    label: 'subClassOf',
    kind: 'property',
    description: 'Superclass relationship',
    position: 'predicate',
  },
  {
    iri: 'http://www.w3.org/2000/01/rdf-schema#subPropertyOf',
    prefixedName: 'rdfs:subPropertyOf',
    label: 'subPropertyOf',
    kind: 'property',
    description: 'Superproperty relationship',
    position: 'predicate',
  },
  {
    iri: 'http://www.w3.org/2000/01/rdf-schema#domain',
    prefixedName: 'rdfs:domain',
    label: 'domain',
    kind: 'property',
    description: 'Domain of a property',
    position: 'predicate',
  },
  {
    iri: 'http://www.w3.org/2000/01/rdf-schema#range',
    prefixedName: 'rdfs:range',
    label: 'range',
    kind: 'property',
    description: 'Range of a property',
    position: 'predicate',
  },
  {
    iri: 'http://www.w3.org/2000/01/rdf-schema#seeAlso',
    prefixedName: 'rdfs:seeAlso',
    label: 'seeAlso',
    kind: 'property',
    description: 'Related resource',
    position: 'predicate',
  },

  // FOAF
  {
    iri: 'http://xmlns.com/foaf/0.1/Person',
    prefixedName: 'foaf:Person',
    label: 'Person',
    kind: 'class',
    description: 'A person',
    position: 'object',
  },
  {
    iri: 'http://xmlns.com/foaf/0.1/Organization',
    prefixedName: 'foaf:Organization',
    label: 'Organization',
    kind: 'class',
    description: 'An organization',
    position: 'object',
  },
  {
    iri: 'http://xmlns.com/foaf/0.1/name',
    prefixedName: 'foaf:name',
    label: 'name',
    kind: 'property',
    description: 'Name of an agent',
    position: 'predicate',
  },
  {
    iri: 'http://xmlns.com/foaf/0.1/knows',
    prefixedName: 'foaf:knows',
    label: 'knows',
    kind: 'property',
    description: 'A person known by this person',
    position: 'predicate',
  },
  {
    iri: 'http://xmlns.com/foaf/0.1/mbox',
    prefixedName: 'foaf:mbox',
    label: 'mbox',
    kind: 'property',
    description: 'Mailbox (email)',
    position: 'predicate',
  },
  {
    iri: 'http://xmlns.com/foaf/0.1/homepage',
    prefixedName: 'foaf:homepage',
    label: 'homepage',
    kind: 'property',
    description: 'Homepage URL',
    position: 'predicate',
  },
  {
    iri: 'http://xmlns.com/foaf/0.1/age',
    prefixedName: 'foaf:age',
    label: 'age',
    kind: 'property',
    description: 'Age in years',
    position: 'predicate',
  },

  // XSD datatypes
  {
    iri: 'http://www.w3.org/2001/XMLSchema#string',
    prefixedName: 'xsd:string',
    label: 'string',
    kind: 'datatype',
    description: 'String datatype',
    position: 'object',
  },
  {
    iri: 'http://www.w3.org/2001/XMLSchema#integer',
    prefixedName: 'xsd:integer',
    label: 'integer',
    kind: 'datatype',
    description: 'Integer datatype',
    position: 'object',
  },
  {
    iri: 'http://www.w3.org/2001/XMLSchema#boolean',
    prefixedName: 'xsd:boolean',
    label: 'boolean',
    kind: 'datatype',
    description: 'Boolean datatype',
    position: 'object',
  },
  {
    iri: 'http://www.w3.org/2001/XMLSchema#dateTime',
    prefixedName: 'xsd:dateTime',
    label: 'dateTime',
    kind: 'datatype',
    description: 'Date-time datatype',
    position: 'object',
  },
  {
    iri: 'http://www.w3.org/2001/XMLSchema#float',
    prefixedName: 'xsd:float',
    label: 'float',
    kind: 'datatype',
    description: 'Float datatype',
    position: 'object',
  },
  {
    iri: 'http://www.w3.org/2001/XMLSchema#double',
    prefixedName: 'xsd:double',
    label: 'double',
    kind: 'datatype',
    description: 'Double datatype',
    position: 'object',
  },
]

// ─── Plugin definition ────────────────────────────────────────────

export const freePlugin: DomainPlugin = {
  id: 'free',
  label: 'Free',

  namespaces: {
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    owl: 'http://www.w3.org/2002/07/owl#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    foaf: 'http://xmlns.com/foaf/0.1/',
  },

  templates: [
    {
      id: 'foaf-graph',
      label: 'FOAF Graph',
      description: 'A social network graph using Friend-of-a-Friend vocabulary',
      turtleContent: FOAF_EXAMPLE,
    },
  ],

  vocabularyItems: RDF_VOCABULARY,
}
