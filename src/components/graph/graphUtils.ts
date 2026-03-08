import type * as N3 from 'n3'
import type { CyNodeData, CyEdgeData } from '../../types/rdf'
import type { CytoscapeStyleRule } from '../../types/domain'
import { shorten, localName } from '../../lib/rdf/namespaces'

export interface CyElements {
  nodes: { data: CyNodeData }[]
  edges: { data: CyEdgeData }[]
}

const MAX_NODES = 300 // Performance guard

const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'

/**
 * Build a map of subject IRI → rdf:type IRIs from the store.
 */
function buildTypeMap(store: N3.Store): Map<string, string[]> {
  const typeMap = new Map<string, string[]>()
  for (const quad of store.match(
    null,
    { termType: 'NamedNode', value: RDF_TYPE } as N3.NamedNode,
    null
  )) {
    if (quad.object.termType === 'NamedNode') {
      const types = typeMap.get(quad.subject.value) ?? []
      types.push(quad.object.value)
      typeMap.set(quad.subject.value, types)
    }
  }
  return typeMap
}

/**
 * Convert N3.Store triples to Cytoscape elements.
 * Blank nodes and literals are represented as nodes.
 * Predicates become directed edges.
 * rdf:type information is attached to each IRI node for type-based styling.
 */
export function storeToCytoscape(store: N3.Store, prefixes: Record<string, string>): CyElements {
  const typeMap = buildTypeMap(store)
  const nodeMap = new Map<string, CyNodeData>()
  const edges: { data: CyEdgeData }[] = []
  let edgeIdx = 0

  const addNode = (
    id: string,
    label: string,
    nodeType: CyNodeData['nodeType'],
    fullIri?: string
  ) => {
    if (!nodeMap.has(id)) {
      const data: CyNodeData = { id, label, nodeType, fullIri }

      // Attach rdf:type info for IRI nodes
      if (nodeType === 'iri' && fullIri) {
        const types = typeMap.get(fullIri)
        if (types && types.length > 0) {
          data.rdfTypes = types
          data.rdfType = localName(types[0])
        }
      }

      nodeMap.set(id, data)
    }
  }

  let count = 0
  for (const quad of store) {
    if (count >= MAX_NODES) break
    count++

    const s = quad.subject
    const p = quad.predicate
    const o = quad.object

    // Subject node
    const sid = s.value
    addNode(
      sid,
      s.termType === 'BlankNode' ? `_:${s.value}` : shorten(s.value, prefixes),
      s.termType === 'BlankNode' ? 'blank' : 'iri',
      s.termType === 'NamedNode' ? s.value : undefined
    )

    // Object node
    const oid = o.termType === 'Literal' ? `lit:${o.value}:${o.datatype?.value ?? ''}` : o.value

    if (o.termType === 'Literal') {
      const lang = o.language ? `@${o.language}` : ''
      const dt = o.datatype ? `^^${shorten(o.datatype.value, prefixes)}` : ''
      addNode(oid, `"${o.value}"${lang}${dt}`, 'literal')
    } else if (o.termType === 'BlankNode') {
      addNode(oid, `_:${o.value}`, 'blank')
    } else {
      addNode(oid, shorten(o.value, prefixes), 'iri', o.value)
    }

    // Edge
    edges.push({
      data: {
        id: `e${edgeIdx++}`,
        source: sid,
        target: oid,
        label: shorten(p.value, prefixes),
        fullIri: p.value,
      },
    })
  }

  return {
    nodes: Array.from(nodeMap.values()).map((data) => ({ data })),
    edges,
  }
}

// ─── Type-based color definitions ──────────────────────────────────

/** Exported for use in GraphLegend */
export const TYPE_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  // OWL / RDFS meta types
  Class: { bg: '#45275e', border: '#cba6f7', label: 'owl:Class / rdfs:Class' },
  Ontology: { bg: '#3b1f3e', border: '#f38ba8', label: 'owl:Ontology' },
  ObjectProperty: { bg: '#1a3a2a', border: '#a6e3a1', label: 'owl:ObjectProperty' },
  DatatypeProperty: { bg: '#1a3835', border: '#94e2d5', label: 'owl:DatatypeProperty' },
  // People / Org
  Person: { bg: '#1a2e4a', border: '#89b4fa', label: 'foaf:Person / schema:Person' },
  Organization: { bg: '#3a2a1a', border: '#fab387', label: 'foaf:Organization' },
  // SKOS
  Concept: { bg: '#3a3520', border: '#f9e2af', label: 'skos:Concept' },
  ConceptScheme: { bg: '#3a3520', border: '#f9e2af', label: 'skos:ConceptScheme' },
  // SAMM
  Aspect: { bg: '#2e1a4e', border: '#b47ded', label: 'samm:Aspect' },
  Property: { bg: '#1a2e4a', border: '#89b4fa', label: 'samm:Property / rdf:Property' },
  Characteristic: { bg: '#1a3a2a', border: '#a6e3a1', label: 'samm:Characteristic' },
  Entity: { bg: '#3a2a1a', border: '#fab387', label: 'samm:Entity' },
}

export const CY_STYLE: CytoscapeStyleRule[] = [
  // ─── Base node style ──────────────────────────────────────────
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      'font-size': 11,
      'font-family': "'JetBrains Mono', monospace",
      color: '#cdd6f4',
      'text-wrap': 'wrap',
      'text-max-width': '150px',
      'text-valign': 'center',
      'text-halign': 'center',
    },
  },
  {
    selector: 'node[nodeType="iri"]',
    style: {
      shape: 'ellipse',
      'background-color': '#1e1e2e',
      'border-color': '#89b4fa',
      'border-width': 2,
      width: 120,
      height: 40,
    },
  },
  {
    selector: 'node[nodeType="blank"]',
    style: {
      shape: 'ellipse',
      'background-color': '#1e1e2e',
      'border-color': '#6c7086',
      'border-width': 1.5,
      'border-style': 'dashed',
      width: 80,
      height: 30,
    },
  },
  {
    selector: 'node[nodeType="literal"]',
    style: {
      shape: 'round-rectangle',
      'background-color': '#313244',
      'border-color': '#f9e2af',
      'border-width': 1,
      width: 140,
      height: 35,
      color: '#f9e2af',
    },
  },

  // ─── rdf:type-based node styling ──────────────────────────────
  ...Object.entries(TYPE_COLORS).map(([type, colors]) => ({
    selector: `node[rdfType="${type}"]`,
    style: {
      'background-color': colors.bg,
      'border-color': colors.border,
      'border-width': 2.5,
    },
  })),

  // ─── Selection ────────────────────────────────────────────────
  {
    selector: 'node:selected',
    style: {
      'border-color': '#cba6f7',
      'border-width': 3,
      'background-color': '#313244',
    },
  },

  // ─── Edge styles ──────────────────────────────────────────────
  {
    selector: 'edge',
    style: {
      label: 'data(label)',
      'font-size': 10,
      'font-family': "'JetBrains Mono', monospace",
      color: '#a6e3a1',
      'text-background-color': '#1e1e2e',
      'text-background-opacity': 0.9,
      'text-background-padding': '2px',
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
      'target-arrow-color': '#45475a',
      'line-color': '#45475a',
      width: 1.5,
    },
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': '#cba6f7',
      'target-arrow-color': '#cba6f7',
      width: 2.5,
    },
  },
]
