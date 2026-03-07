import { useMemo, useState } from 'react'
import { Plus, ChevronRight, Box } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { findAspects, readAspect, findEntities, readEntity } from '../../lib/samm/reader'
import { newAspectTemplate } from '../../lib/samm/templates'
import { SAMM_NS } from '../../lib/samm/vocabulary'
import AspectForm from './AspectForm'
import EntityForm from './EntityForm'

type Selection =
  | { kind: 'aspect'; iri: string }
  | { kind: 'entity'; iri: string }
  | null

function localName(iri: string) {
  const sep = Math.max(iri.lastIndexOf('#'), iri.lastIndexOf('/'))
  return sep >= 0 ? iri.slice(sep + 1) : iri
}

export default function SammPanel() {
  const store = useAppStore((s) => s.store)
  const turtleText = useAppStore((s) => s.turtleText)
  const setTurtleText = useAppStore((s) => s.setTurtleText)
  const [selected, setSelected] = useState<Selection>(null)
  const [showNewAspect, setShowNewAspect] = useState(false)
  const [newName, setNewName] = useState('')
  const [newNs, setNewNs] = useState('urn:samm:com.example:1.0.0')

  const aspectIris = useMemo(() => findAspects(store), [store])
  const entityIris = useMemo(() => findEntities(store), [store])

  const selectedAspect = useMemo(() => {
    if (selected?.kind === 'aspect') return readAspect(store, selected.iri)
    return null
  }, [store, selected])

  const selectedEntity = useMemo(() => {
    if (selected?.kind === 'entity') return readEntity(store, selected.iri)
    return null
  }, [store, selected])

  function createAspect() {
    if (!newName.trim()) return
    const snippet = newAspectTemplate(newName.trim(), newNs.trim())
    setTurtleText(turtleText + '\n' + snippet)
    setShowNewAspect(false)
    setNewName('')
  }

  return (
    <div className="flex h-full text-xs">
      {/* Left tree panel */}
      <div className="w-52 border-r border-surface-raised flex flex-col bg-surface-alt overflow-y-auto">
        {/* Aspects */}
        <div className="px-3 py-2 text-text-muted font-medium uppercase tracking-wider text-[10px]">
          Aspects
          <button
            onClick={() => setShowNewAspect(true)}
            className="float-right text-accent-blue hover:text-accent-purple"
            title="New Aspect"
          >
            <Plus size={12} />
          </button>
        </div>

        {aspectIris.length === 0 && (
          <div className="px-3 py-2 text-text-muted italic">No Aspects found</div>
        )}
        {aspectIris.map((iri) => (
          <button
            key={iri}
            onClick={() => setSelected({ kind: 'aspect', iri })}
            className={`flex items-center gap-1.5 px-3 py-1.5 w-full text-left hover:bg-surface-raised truncate ${
              selected?.iri === iri ? 'bg-surface-raised text-accent-purple' : 'text-text-primary'
            }`}
          >
            <Box size={11} className="text-accent-purple shrink-0" />
            <span className="truncate">{localName(iri)}</span>
            {selected?.iri === iri && <ChevronRight size={11} className="ml-auto shrink-0" />}
          </button>
        ))}

        {/* Entities */}
        {entityIris.length > 0 && (
          <>
            <div className="px-3 py-2 mt-2 text-text-muted font-medium uppercase tracking-wider text-[10px] border-t border-surface-raised">
              Entities
            </div>
            {entityIris.map((iri) => (
              <button
                key={iri}
                onClick={() => setSelected({ kind: 'entity', iri })}
                className={`flex items-center gap-1.5 px-3 py-1.5 w-full text-left hover:bg-surface-raised truncate ${
                  selected?.iri === iri ? 'bg-surface-raised text-accent-cyan' : 'text-text-primary'
                }`}
              >
                <span className="text-accent-cyan font-bold">E</span>
                <span className="truncate">{localName(iri)}</span>
              </button>
            ))}
          </>
        )}

        {/* SAMM ns indicator */}
        <div className="mt-auto px-3 py-2 text-[10px] text-text-muted border-t border-surface-raised">
          SAMM 2.2.0
        </div>
      </div>

      {/* Right detail panel */}
      <div className="flex-1 overflow-y-auto">
        {/* New Aspect dialog */}
        {showNewAspect && (
          <div className="p-4 border-b border-surface-raised bg-surface-raised">
            <div className="text-sm font-medium text-text-primary mb-3">New Aspect</div>
            <div className="space-y-2">
              <div>
                <label className="text-text-muted block mb-1">Name</label>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createAspect()}
                  placeholder="MyAspect"
                  className="w-full bg-surface border border-surface-raised rounded px-2 py-1 text-text-primary outline-none focus:border-accent-blue"
                />
              </div>
              <div>
                <label className="text-text-muted block mb-1">Namespace</label>
                <input
                  value={newNs}
                  onChange={(e) => setNewNs(e.target.value)}
                  placeholder="urn:samm:com.example:1.0.0"
                  className="w-full bg-surface border border-surface-raised rounded px-2 py-1 text-text-primary outline-none focus:border-accent-blue font-mono"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={createAspect}
                  className="px-3 py-1 rounded bg-accent-blue text-surface font-medium hover:opacity-90"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewAspect(false)}
                  className="px-3 py-1 rounded bg-surface border border-surface-raised text-text-primary hover:bg-surface-raised"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedAspect && <AspectForm aspect={selectedAspect} />}
        {selectedEntity && <EntityForm entity={selectedEntity} />}

        {!selectedAspect && !selectedEntity && !showNewAspect && (
          <div className="flex flex-col items-center justify-center h-full text-text-muted gap-3">
            <Box size={32} strokeWidth={1} />
            <div className="text-center">
              <p>Select an Aspect or Entity</p>
              <p className="text-[11px] mt-1 opacity-70">or create a new Aspect →</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
