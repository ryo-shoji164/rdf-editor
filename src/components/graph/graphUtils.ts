import type * as N3 from 'n3'
import type { CyNodeData, CyEdgeData } from '../../types/rdf'
import { shorten } from '../../lib/rdf/namespaces'

export interface CyElements {
  nodes: { data: CyNodeData }[]
  edges: { data: CyEdgeData }[]
}

const MAX_NODES = 300 // Performance guard

/**
 * Convert N3.Store triples to Cytoscape elements.
 * Blank nodes and literals are represented as nodes.
 * Predicates become directed edges.
 */
export function storeToCytoscape(store: N3.Store, prefixes: Record<string, string>): CyElements {
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
      nodeMap.set(id, { id, label, nodeType, fullIri })
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CY_STYLE: any[] = [
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
  {
    selector: 'node:selected',
    style: {
      'border-color': '#cba6f7',
      'border-width': 3,
      'background-color': '#313244',
    },
  },
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
