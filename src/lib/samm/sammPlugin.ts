/**
 * SAMM (Semantic Aspect Meta Model) Domain Plugin
 *
 * Provides SAMM-specific namespaces, vocabulary, templates, and graph styles
 * for modeling Eclipse ESMF Aspect Models.
 */
import type { DomainPlugin, VocabularyItem } from '../../types/domain'
import { SAMM_NS, SAMM_C_NS, SAMM_E_NS, UNIT_NS } from './vocabulary'
import { SAMM_EXAMPLE } from './templates'

// ─── Vocabulary items for code completion ─────────────────────────

const SAMM_VOCABULARY: VocabularyItem[] = [
    // Classes
    { iri: `${SAMM_NS}Aspect`, prefixedName: 'samm:Aspect', label: 'Aspect', kind: 'class', description: 'Root element of a SAMM model', position: 'object' },
    { iri: `${SAMM_NS}Property`, prefixedName: 'samm:Property', label: 'Property', kind: 'class', description: 'A typed attribute of an Aspect or Entity', position: 'object' },
    { iri: `${SAMM_NS}Characteristic`, prefixedName: 'samm:Characteristic', label: 'Characteristic', kind: 'class', description: 'Describes how a Property value looks', position: 'object' },
    { iri: `${SAMM_NS}Entity`, prefixedName: 'samm:Entity', label: 'Entity', kind: 'class', description: 'A complex data structure with its own properties', position: 'object' },
    { iri: `${SAMM_NS}Operation`, prefixedName: 'samm:Operation', label: 'Operation', kind: 'class', description: 'An operation that can be invoked on an Aspect', position: 'object' },
    { iri: `${SAMM_NS}Event`, prefixedName: 'samm:Event', label: 'Event', kind: 'class', description: 'An event emitted by an Aspect', position: 'object' },
    { iri: `${SAMM_NS}Constraint`, prefixedName: 'samm:Constraint', label: 'Constraint', kind: 'class', description: 'A restriction on a Characteristic', position: 'object' },

    // Properties
    { iri: `${SAMM_NS}preferredName`, prefixedName: 'samm:preferredName', label: 'preferredName', kind: 'property', description: 'Human-readable name (with language tag)', position: 'predicate' },
    { iri: `${SAMM_NS}description`, prefixedName: 'samm:description', label: 'description', kind: 'property', description: 'Human-readable description (with language tag)', position: 'predicate' },
    { iri: `${SAMM_NS}properties`, prefixedName: 'samm:properties', label: 'properties', kind: 'property', description: 'List of properties of an Aspect or Entity', position: 'predicate' },
    { iri: `${SAMM_NS}operations`, prefixedName: 'samm:operations', label: 'operations', kind: 'property', description: 'List of operations on an Aspect', position: 'predicate' },
    { iri: `${SAMM_NS}events`, prefixedName: 'samm:events', label: 'events', kind: 'property', description: 'List of events on an Aspect', position: 'predicate' },
    { iri: `${SAMM_NS}characteristic`, prefixedName: 'samm:characteristic', label: 'characteristic', kind: 'property', description: 'The Characteristic of a Property', position: 'predicate' },
    { iri: `${SAMM_NS}dataType`, prefixedName: 'samm:dataType', label: 'dataType', kind: 'property', description: 'The data type of a Characteristic', position: 'predicate' },
    { iri: `${SAMM_NS}exampleValue`, prefixedName: 'samm:exampleValue', label: 'exampleValue', kind: 'property', description: 'Example value for a Property', position: 'predicate' },

    // Built-in characteristics (samm-c)
    { iri: `${SAMM_C_NS}Text`, prefixedName: 'samm-c:Text', label: 'Text', kind: 'class', description: 'String characteristic', position: 'object' },
    { iri: `${SAMM_C_NS}Boolean`, prefixedName: 'samm-c:Boolean', label: 'Boolean', kind: 'class', description: 'Boolean characteristic', position: 'object' },
    { iri: `${SAMM_C_NS}Timestamp`, prefixedName: 'samm-c:Timestamp', label: 'Timestamp', kind: 'class', description: 'Date-time characteristic', position: 'object' },
    { iri: `${SAMM_C_NS}Measurement`, prefixedName: 'samm-c:Measurement', label: 'Measurement', kind: 'class', description: 'Numeric measurement with unit', position: 'object' },
    { iri: `${SAMM_C_NS}Quantifiable`, prefixedName: 'samm-c:Quantifiable', label: 'Quantifiable', kind: 'class', description: 'Numeric value with optional unit', position: 'object' },
    { iri: `${SAMM_C_NS}Duration`, prefixedName: 'samm-c:Duration', label: 'Duration', kind: 'class', description: 'Time duration characteristic', position: 'object' },
    { iri: `${SAMM_C_NS}Enumeration`, prefixedName: 'samm-c:Enumeration', label: 'Enumeration', kind: 'class', description: 'Fixed set of values', position: 'object' },
    { iri: `${SAMM_C_NS}State`, prefixedName: 'samm-c:State', label: 'State', kind: 'class', description: 'State machine with default value', position: 'object' },
    { iri: `${SAMM_C_NS}Collection`, prefixedName: 'samm-c:Collection', label: 'Collection', kind: 'class', description: 'Unordered collection', position: 'object' },
    { iri: `${SAMM_C_NS}List`, prefixedName: 'samm-c:List', label: 'List', kind: 'class', description: 'Ordered collection', position: 'object' },
    { iri: `${SAMM_C_NS}Set`, prefixedName: 'samm-c:Set', label: 'Set', kind: 'class', description: 'Unordered unique collection', position: 'object' },
    { iri: `${SAMM_C_NS}SingleEntity`, prefixedName: 'samm-c:SingleEntity', label: 'SingleEntity', kind: 'class', description: 'Characteristic referencing an Entity', position: 'object' },
    { iri: `${SAMM_C_NS}unit`, prefixedName: 'samm-c:unit', label: 'unit', kind: 'property', description: 'Unit of measurement', position: 'predicate' },
]

// ─── Plugin definition ────────────────────────────────────────────

export const sammPlugin: DomainPlugin = {
    id: 'samm',
    label: 'SAMM',

    namespaces: {
        'samm': SAMM_NS,
        'samm-c': SAMM_C_NS,
        'samm-e': SAMM_E_NS,
        'unit': UNIT_NS,
    },

    templates: [
        {
            id: 'samm-aspect',
            label: 'SAMM Aspect',
            description: 'A complete SAMM Aspect Model with properties, characteristics, and units',
            turtleContent: SAMM_EXAMPLE,
        },
    ],

    vocabularyItems: SAMM_VOCABULARY,

    graphStyles: [
        {
            selector: 'node[label = "samm:Aspect"]',
            style: {
                'background-color': '#7c3aed',
                'border-color': '#6d28d9',
            },
        },
        {
            selector: 'node[label = "samm:Property"]',
            style: {
                'background-color': '#2563eb',
                'border-color': '#1d4ed8',
            },
        },
        {
            selector: 'node[label = "samm:Characteristic"]',
            style: {
                'background-color': '#059669',
                'border-color': '#047857',
            },
        },
        {
            selector: 'node[label = "samm:Entity"]',
            style: {
                'background-color': '#d97706',
                'border-color': '#b45309',
            },
        },
    ],
}
