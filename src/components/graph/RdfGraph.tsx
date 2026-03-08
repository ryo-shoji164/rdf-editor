import { useEffect, useRef, useCallback, useMemo } from 'react'
import cytoscape from 'cytoscape'
import coseBilkent from 'cytoscape-cose-bilkent'
import { useRdfStore } from '../../store/rdfStore'
import { useUiStore } from '../../store/uiStore'
import { useDomainStore } from '../../store/domainStore'
import { storeToCytoscape, CY_STYLE } from './graphUtils'
import GraphLegend from './GraphLegend'

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

  const tripleCount = store.size

  return (
    <div className="flex flex-col h-full relative">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-surface-raised text-xs">
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
      <div ref={containerRef} className="flex-1 w-full" />

      {/* Legend overlay */}
      <GraphLegend />
    </div>
  )
}
