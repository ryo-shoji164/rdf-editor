import { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import cytoscape from 'cytoscape'
import coseBilkent from 'cytoscape-cose-bilkent'
import { useRdfStore } from '../../store/rdfStore'
import { useUiStore } from '../../store/uiStore'
import { useDomainStore } from '../../store/domainStore'
import { useAppStore } from '../../store/appStore'
import { addTriple } from '../../lib/rdf/storeWriter'
import { storeToCytoscape, CY_STYLE } from './graphUtils'
import { Plus, Link2 } from 'lucide-react'
import GraphLegend from './GraphLegend'
import GraphContextMenu from './GraphContextMenu'
import type { ContextMenuTargetType } from './GraphContextMenu'
import AddNodeDialog from './AddNodeDialog'
import AddEdgeDialog from './AddEdgeDialog'

cytoscape.use(coseBilkent)

export default function RdfGraph() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)

  const store = useRdfStore((s) => s.store)
  const prefixes = useRdfStore((s) => s.prefixes)
  const selectedNode = useUiStore((s) => s.selectedNode)
  const setSelectedNode = useUiStore((s) => s.setSelectedNode)
  const activeDomainId = useDomainStore((s) => s.activeDomainId)
  const registeredDomains = useDomainStore((s) => s.registeredDomains)
  const applyStoreChange = useAppStore((s) => s.applyStoreChange)

  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [menuTarget, setMenuTarget] = useState<ContextMenuTargetType>(null)
  const [menuNodeId, setMenuNodeId] = useState<string | null>(null)

  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false)
  const [isAddEdgeOpen, setIsAddEdgeOpen] = useState(false)

  // Merge base CY_STYLE with active domain plugin graphStyles
  const mergedStyle = useMemo(() => {
    const domain = registeredDomains.get(activeDomainId)
    if (!domain) return CY_STYLE

    // Check if domain info has a graphStyles property (from DomainPlugin)
    const domainWithStyles = domain as {
      graphStyles?: { selector: string; style: Record<string, string | number> }[]
    }
    if (!domainWithStyles.graphStyles || domainWithStyles.graphStyles.length === 0) return CY_STYLE

    // Insert domain styles before the :selected rules so they take precedence
    // over base IRI styles but not over selection styles
    const baseStyles = [...CY_STYLE]
    const domainStyles = domainWithStyles.graphStyles.map((rule) => ({
      selector: rule.selector,
      style: rule.style,
    }))

    // Find the index of 'node:selected' to insert domain styles before it
    const selectedIdx = baseStyles.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => s.selector === 'node:selected'
    )
    if (selectedIdx >= 0) {
      baseStyles.splice(selectedIdx, 0, ...domainStyles)
    } else {
      baseStyles.push(...domainStyles)
    }

    return baseStyles
  }, [activeDomainId, registeredDomains])

  // Initialize cytoscape once
  useEffect(() => {
    if (!containerRef.current) return

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: mergedStyle,
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    })

    cy.on('tap', 'node', (e) => {
      const data = e.target.data()
      if (data.nodeType === 'iri' && data.fullIri) {
        setSelectedNode(data.fullIri)
      } else {
        setSelectedNode(null)
      }
    })

    cy.on('tap', (e) => {
      if (e.target === cy) setSelectedNode(null)
    })

    cy.on('cxttap', (e) => {
      // Get position relative to the graph container
      const x = e.renderedPosition ? e.renderedPosition.x : e.originalEvent.offsetX
      const y = e.renderedPosition ? e.renderedPosition.y : e.originalEvent.offsetY

      setMenuPos({ x, y })

      if (e.target === cy) {
        setMenuTarget('bg')
        setMenuNodeId(null)
      } else if (e.target.isNode && e.target.isNode()) {
        setMenuTarget('node')
        setMenuNodeId(e.target.data('fullIri'))
      } else {
        setMenuTarget(null)
      }
      setMenuOpen(true)
    })

    cyRef.current = cy
    return () => cy.destroy()
  }, [setSelectedNode, mergedStyle])

  // Update graph data when store changes
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    const elements = storeToCytoscape(store, prefixes)

    cy.batch(() => {
      cy.elements().remove()
      cy.add([...elements.nodes, ...elements.edges])
    })

    const totalNodes = elements.nodes.length
    const layout = cy.layout({
      name: totalNodes > 80 ? 'cose' : 'cose-bilkent',
      animate: totalNodes <= 50,
      animationDuration: 300,
      fit: true,
      padding: 30,
      // cose-bilkent options
      nodeDimensionsIncludeLabels: true,
      idealEdgeLength: 120,
      edgeElasticity: 0.45,
      nodeRepulsion: 4500,
      gravity: 0.25,
      // cose options (fallback)
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0,
    } as Parameters<typeof cy.layout>[0])

    layout.run()
  }, [store, prefixes])

  // Sync selected node highlight
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    cy.elements().removeClass('selected')
    if (selectedNode) {
      cy.getElementById(selectedNode).addClass('selected')
    }
  }, [selectedNode])

  const handleFitView = useCallback(() => {
    cyRef.current?.fit(undefined, 30)
  }, [])

  const handleRelayout = useCallback(() => {
    const cy = cyRef.current
    if (!cy) return
    const layout = cy.layout({
      name: 'cose-bilkent',
      animate: true,
      animationDuration: 500,
      fit: true,
      padding: 30,
      nodeDimensionsIncludeLabels: true,
      idealEdgeLength: 120,
    } as Parameters<typeof cy.layout>[0])
    layout.run()
  }, [])

  const handleAddNode = async (iri: string, label?: string) => {
    // Add default type quad so empty nodes behave like resources initially
    const added = addTriple(store, {
      subject: iri,
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      object: 'http://www.w3.org/2000/01/rdf-schema#Resource',
      objectType: 'iri',
    })

    let addedLabel = false
    if (label) {
      addedLabel = addTriple(store, {
        subject: iri,
        predicate: 'http://www.w3.org/2000/01/rdf-schema#label',
        object: label,
        objectType: 'literal',
      })
    }

    if (added || addedLabel) {
      await applyStoreChange()
    }
  }

  const handleAddEdge = async (subject: string, predicate: string, object: string, isLiteral: boolean) => {
    const added = addTriple(store, {
      subject,
      predicate,
      object,
      objectType: isLiteral ? 'literal' : 'iri',
    })
    if (added) {
      await applyStoreChange()
    }
  }

  const tripleCount = store.size

  return (
    <div className="flex flex-col h-full relative">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-surface-raised text-xs">
        <button
          onClick={() => setIsAddNodeOpen(true)}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-accent-blue text-white hover:bg-blue-600 transition-colors"
        >
          <Plus size={14} />
          Add Node
        </button>
        <button
          onClick={() => {
            setMenuNodeId(selectedNode) // Use currently selected node as Subject default
            setIsAddEdgeOpen(true)
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-raised text-text-primary border border-surface-raised hover:bg-surface transition-colors"
        >
          <Link2 size={14} />
          Add Edge
        </button>
        <div className="w-px h-4 bg-surface-raised mx-1"></div>
        <button
          onClick={handleFitView}
          className="px-2 py-0.5 rounded bg-surface-raised hover:bg-surface text-text-primary border border-surface-raised"
        >
          Fit
        </button>
        <button
          onClick={handleRelayout}
          className="px-2 py-0.5 rounded bg-surface-raised hover:bg-surface text-text-primary border border-surface-raised"
        >
          Re-layout
        </button>
        <span className="ml-auto text-text-muted">
          {tripleCount} triple{tripleCount !== 1 ? 's' : ''}
          {tripleCount >= 300 && <span className="ml-1 text-accent-yellow">(max 300 shown)</span>}
        </span>
      </div>

      {/* Cytoscape container */}
      <div ref={containerRef} data-testid="cytoscape-container" className="flex-1 w-full" />

      {/* Legend overlay */}
      <GraphLegend />

      {/* Context Menu and Dialogs */}
      <GraphContextMenu
        isOpen={menuOpen}
        position={menuPos}
        targetType={menuTarget}
        targetId={menuNodeId || undefined}
        onClose={() => setMenuOpen(false)}
        onAddNode={() => {
          setMenuOpen(false)
          setIsAddNodeOpen(true)
        }}
        onAddEdgeFromCurrent={() => {
          setMenuOpen(false)
          setIsAddEdgeOpen(true)
        }}
      />

      <AddNodeDialog
        isOpen={isAddNodeOpen}
        onClose={() => setIsAddNodeOpen(false)}
        onSubmit={handleAddNode}
      />

      <AddEdgeDialog
        isOpen={isAddEdgeOpen}
        sourceNodeId={menuNodeId}
        onClose={() => setIsAddEdgeOpen(false)}
        onSubmit={handleAddEdge}
      />
    </div>
  )
}
