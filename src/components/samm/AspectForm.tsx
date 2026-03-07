import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import type { SammAspect } from '../../types/rdf'
import { useAppStore } from '../../store/appStore'
import { newPropertySnippet } from '../../lib/samm/templates'
import { localName } from '../../lib/rdf/namespaces'
import { SAMM_C } from '../../lib/samm/vocabulary'
import PropertyCard from './PropertyCard'

interface Props {
  aspect: SammAspect
}

const CHAR_OPTIONS = [
  { label: 'Text', iri: SAMM_C.Text },
  { label: 'Boolean', iri: SAMM_C.Boolean },
  { label: 'Timestamp', iri: SAMM_C.Timestamp },
  { label: 'Measurement', iri: SAMM_C.Measurement },
  { label: 'Quantifiable', iri: SAMM_C.Quantifiable },
  { label: 'Collection', iri: SAMM_C.Collection },
  { label: 'Set', iri: SAMM_C.Set },
  { label: 'List', iri: SAMM_C.List },
  { label: 'Enumeration', iri: SAMM_C.Enumeration },
]

function iriNamespace(iri: string) {
  const hash = iri.lastIndexOf('#')
  return hash >= 0 ? iri.slice(0, hash + 1) : iri
}

export default function AspectForm({ aspect }: Props) {
  const turtleText = useAppStore((s) => s.turtleText)
  const setTurtleText = useAppStore((s) => s.setTurtleText)
  const [showAddProp, setShowAddProp] = useState(false)
  const [propName, setPropName] = useState('')
  const [charIri, setCharIri] = useState(SAMM_C.Text)
  const [expanded, setExpanded] = useState(true)

  const namespace = iriNamespace(aspect.iri)

  function addProperty() {
    if (!propName.trim()) return
    const snippet = newPropertySnippet(propName.trim(), namespace, charIri)
    const propRef = `:${propName.trim()}`
    // Insert the new property reference into the samm:properties list.
    // A single regex handles both the empty-list and non-empty-list cases.
    const updated = turtleText.replace(
      /samm:properties\s*\(([^)]*)\)/,
      (_, inner) => {
        const trimmed = inner.trim()
        return trimmed
          ? `samm:properties ( ${trimmed} ${propRef} )`
          : `samm:properties ( ${propRef} )`
      }
    )
    setTurtleText(updated + snippet)
    setShowAddProp(false)
    setPropName('')
    setCharIri(SAMM_C.Text)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-accent-purple">{localName(aspect.iri)}</div>
          <div className="text-[10px] text-text-muted font-mono truncate max-w-xs" title={aspect.iri}>
            {aspect.iri}
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-raised text-text-muted">
          samm:Aspect
        </span>
      </div>

      {/* Metadata */}
      {(aspect.preferredName || aspect.description) && (
        <div className="space-y-1 text-[11px]">
          {aspect.preferredName && (
            <div>
              <span className="text-text-muted">Preferred name: </span>
              <span className="text-text-primary">{aspect.preferredName}</span>
            </div>
          )}
          {aspect.description && (
            <div>
              <span className="text-text-muted">Description: </span>
              <span className="text-text-primary">{aspect.description}</span>
            </div>
          )}
        </div>
      )}

      {/* Properties section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[11px] font-medium text-text-primary"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            Properties ({aspect.properties.length})
          </button>
          <button
            onClick={() => setShowAddProp(true)}
            className="flex items-center gap-1 text-[11px] text-accent-blue hover:text-accent-purple"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {/* Add property form */}
        {showAddProp && (
          <div className="mb-3 p-3 rounded bg-surface-raised border border-surface space-y-2">
            <div>
              <label className="text-[10px] text-text-muted block mb-1">Property name</label>
              <input
                autoFocus
                value={propName}
                onChange={(e) => setPropName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addProperty()}
                placeholder="myProperty"
                className="w-full bg-surface border border-surface-raised rounded px-2 py-1 text-text-primary outline-none focus:border-accent-blue text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-text-muted block mb-1">Characteristic</label>
              <select
                value={charIri}
                onChange={(e) => setCharIri(e.target.value)}
                className="w-full bg-surface border border-surface-raised rounded px-2 py-1 text-text-primary outline-none focus:border-accent-blue text-xs"
              >
                {CHAR_OPTIONS.map((o) => (
                  <option key={o.iri} value={o.iri}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addProperty}
                className="px-3 py-1 rounded bg-accent-blue text-surface font-medium text-xs hover:opacity-90"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddProp(false)}
                className="px-3 py-1 rounded bg-surface border border-surface-raised text-text-primary text-xs hover:bg-surface-raised"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {expanded && (
          <div className="space-y-2">
            {aspect.properties.map((prop) => (
              <PropertyCard key={prop.iri} property={prop} />
            ))}
            {aspect.properties.length === 0 && !showAddProp && (
              <div className="text-[11px] text-text-muted italic py-2">
                No properties. Click + Add to add one.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Operations */}
      {aspect.operations.length > 0 && (
        <div>
          <div className="text-[11px] font-medium text-text-primary mb-2">
            Operations ({aspect.operations.length})
          </div>
          {aspect.operations.map((op) => (
            <div key={op.iri} className="text-[11px] text-text-muted px-2 py-1">
              {localName(op.iri)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
