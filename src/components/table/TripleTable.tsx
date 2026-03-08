import { useMemo, useState, useRef, useEffect } from 'react'
import { useRdfStore } from '../../store/rdfStore'
import { useUiStore } from '../../store/uiStore'
import { storeToTriples } from '../../lib/rdf/store'
import { updateTriple } from '../../lib/rdf/storeWriter'
import { shorten, expand } from '../../lib/rdf/namespaces'
import type { Triple } from '../../types/rdf'
import { Search } from 'lucide-react'

const PAGE_SIZE = 100

export default function TripleTable() {
  const store = useRdfStore((s) => s.store)
  const prefixes = useRdfStore((s) => s.prefixes)
  const applyStoreChange = useRdfStore((s) => s.applyStoreChange)
  const setSelectedNode = useUiStore((s) => s.setSelectedNode)

  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(0)

  // { rowIndex: number, column: string, value: string }
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number
    column: 'subject' | 'predicate' | 'object'
    value: string
  } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      // Optional: place cursor at the end
      inputRef.current.selectionStart = inputRef.current.value.length
      inputRef.current.selectionEnd = inputRef.current.value.length
    }
  }, [editingCell])

  const allTriples = useMemo(() => storeToTriples(store), [store])

  const filtered = useMemo(() => {
    if (!filter) return allTriples
    const lower = filter.toLowerCase()
    return allTriples.filter(
      (t) =>
        t.subject.toLowerCase().includes(lower) ||
        t.predicate.toLowerCase().includes(lower) ||
        t.object.toLowerCase().includes(lower)
    )
  }, [allTriples, filter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function formatRdfTerm(iri: string, type: Triple['objectType'] = 'iri'): string {
    if (type === 'literal') return `"${iri}"`
    if (type === 'blank') return `_:${iri}`
    return shorten(iri, prefixes)
  }

  // Double click handler
  const handleDoubleClick = (
    rowIndex: number,
    column: 'subject' | 'predicate' | 'object',
    triple: Triple
  ) => {
    // Determine the raw value to edit
    let rawValue = triple[column]
    if (column === 'object' && triple.objectType === 'literal') {
      rawValue = triple.object // Edit the literal content directly
    } else if (triple.objectType === 'blank' && column === 'object') {
      rawValue = `_:${triple.object}`
    } else {
      // For IRIs, if it can be shortened, we let them edit the shortened form
      rawValue = shorten(triple[column], prefixes)
    }

    setEditingCell({ rowIndex, column, value: rawValue })
  }

  const handleSave = async (triple: Triple) => {
    if (!editingCell) return

    const { column, value } = editingCell
    setEditingCell(null)

    // Expand if needed
    const newValue = value.trim()
    if (!newValue) return // Don't allow empty deletes through inline edit yet

    // Determine type and full IRI/Literal representation
    let newObject = triple.object
    let newSubject = triple.subject
    let newPredicate = triple.predicate

    if (column === 'subject') {
      newSubject = expand(newValue, prefixes)
    } else if (column === 'predicate') {
      newPredicate = expand(newValue, prefixes)
    } else if (column === 'object') {
      if (triple.objectType === 'literal') {
        newObject = newValue
      } else if (newValue.startsWith('_:')) {
        newObject = newValue.substring(2)
      } else {
        newObject = expand(newValue, prefixes)
      }
    }

    // Only update if something changed
    if (
      newSubject === triple.subject &&
      newPredicate === triple.predicate &&
      newObject === triple.object
    ) {
      return
    }

    const newTriple: Triple = {
      subject: newSubject,
      predicate: newPredicate,
      object: newObject,
      objectType: triple.objectType, // Keep the same type for now (unless we detect blank node change, but let's keep it simple)
      language: column === 'object' ? triple.language : undefined,
      datatype: column === 'object' ? triple.datatype : undefined,
    }

    // If they changed object to a blank node notation, ensure objectType is updated just in case
    if (column === 'object' && newValue.startsWith('_:')) {
      newTriple.objectType = 'blank'
    } else if (column === 'object' && triple.objectType === 'blank' && !newValue.startsWith('_:')) {
      // Changing from blank node to IRI
      newTriple.objectType = 'iri'
    }

    const changed = updateTriple(store, triple, newTriple)
    if (changed) {
      await applyStoreChange()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, triple: Triple) => {
    if (e.key === 'Enter') {
      e.stopPropagation()
      handleSave(triple)
    } else if (e.key === 'Escape') {
      e.stopPropagation()
      setEditingCell(null)
    }
  }

  return (
    <div id="joyride-table" className="flex flex-col h-full text-xs">
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-surface-raised">
        <Search size={13} className="text-text-muted shrink-0" />
        <input
          type="text"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value)
            setPage(0)
          }}
          placeholder="Filter subjects, predicates, objects…"
          className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-muted"
        />
        <span className="text-text-muted shrink-0">
          {filtered.length} / {allTriples.length}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-surface-alt border-b border-surface-raised">
              <th className="text-left px-3 py-1.5 text-text-muted font-normal w-1/3">Subject</th>
              <th className="text-left px-3 py-1.5 text-text-muted font-normal w-1/3">Predicate</th>
              <th className="text-left px-3 py-1.5 text-text-muted font-normal w-1/3">Object</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((t, i) => (
              <tr
                key={i}
                className="border-b border-surface-raised hover:bg-surface-raised transition-colors"
                onClick={(e) => {
                  // Don't select row if we are currently clicking inside an input
                  if ((e.target as HTMLElement).tagName !== 'INPUT') {
                    if (t.objectType === 'iri') {
                      setSelectedNode(t.object)
                    } else {
                      setSelectedNode(t.subject)
                    }
                  }
                }}
              >
                {['subject', 'predicate', 'object'].map((col) => {
                  const isEditing = editingCell?.rowIndex === i && editingCell?.column === col
                  const column = col as 'subject' | 'predicate' | 'object'

                  return (
                    <td
                      key={col}
                      className={`px-3 py-1 truncate max-w-0 w-1/3 ${isEditing ? 'p-0' : ''}`}
                      onDoubleClick={() => !isEditing && handleDoubleClick(i, column, t)}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="text"
                          className="w-full bg-editor text-text-primary px-2 py-1 outline-none focus:ring-1 focus:ring-accent-blue font-mono text-xs border border-accent-blue rounded-sm"
                          value={editingCell.value}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) =>
                            setEditingCell({ ...editingCell, value: e.target.value })
                          }
                          onBlur={() => handleSave(t)}
                          onKeyDown={(e) => handleKeyDown(e, t)}
                        />
                      ) : (
                        <div
                          className={`truncate ${col === 'subject' ? 'text-accent-blue' : col === 'predicate' ? 'text-accent-green' : ''}`}
                          title={
                            col === 'object' && t.objectType === 'literal'
                              ? t.object
                              : formatRdfTerm(t[column], col === 'object' ? t.objectType : 'iri')
                          }
                        >
                          {col === 'object' ? (
                            t.objectType === 'literal' ? (
                              <span className="text-accent-yellow">
                                "{t.object}"
                                {t.language && (
                                  <span className="text-text-muted ml-1">@{t.language}</span>
                                )}
                                {t.datatype && !t.language && (
                                  <span className="text-text-muted ml-1">
                                    ^^{shorten(t.datatype, prefixes)}
                                  </span>
                                )}
                              </span>
                            ) : t.objectType === 'blank' ? (
                              <span className="text-text-muted">_:{t.object}</span>
                            ) : (
                              <span className="text-accent-blue">{formatRdfTerm(t.object)}</span>
                            )
                          ) : (
                            <span>{formatRdfTerm(t[column])}</span>
                          )}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-text-muted">
                  No triples found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-surface-raised">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-2 py-0.5 rounded bg-surface-raised disabled:opacity-40 hover:bg-surface"
          >
            ‹ Prev
          </button>
          <span className="text-text-muted">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-2 py-0.5 rounded bg-surface-raised disabled:opacity-40 hover:bg-surface"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  )
}
