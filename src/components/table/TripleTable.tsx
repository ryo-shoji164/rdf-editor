import { useMemo, useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { storeToTriples } from '../../lib/rdf/store'
import { shorten } from '../../lib/rdf/namespaces'
import type { Triple } from '../../types/rdf'
import { Search } from 'lucide-react'

const PAGE_SIZE = 100

export default function TripleTable() {
  const store = useAppStore((s) => s.store)
  const prefixes = useAppStore((s) => s.prefixes)
  const setSelectedNode = useAppStore((s) => s.setSelectedNode)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(0)

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

  function fmt(iri: string, type: Triple['objectType'] = 'iri'): string {
    if (type === 'literal') return `"${iri}"`
    if (type === 'blank') return `_:${iri}`
    return shorten(iri, prefixes)
  }

  return (
    <div className="flex flex-col h-full text-xs">
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-surface-raised">
        <Search size={13} className="text-text-muted shrink-0" />
        <input
          type="text"
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(0) }}
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
                className="border-b border-surface-raised hover:bg-surface-raised cursor-pointer"
                onClick={() => t.objectType === 'iri' ? setSelectedNode(t.object) : setSelectedNode(t.subject)}
              >
                <td className="px-3 py-1 text-accent-blue truncate max-w-0 w-1/3">
                  <span title={t.subject}>{fmt(t.subject)}</span>
                </td>
                <td className="px-3 py-1 text-accent-green truncate max-w-0 w-1/3">
                  <span title={t.predicate}>{fmt(t.predicate)}</span>
                </td>
                <td className="px-3 py-1 max-w-0 w-1/3">
                  {t.objectType === 'literal' ? (
                    <span className="text-accent-yellow truncate block" title={t.object}>
                      "{t.object}"
                      {t.language && <span className="text-text-muted ml-1">@{t.language}</span>}
                      {t.datatype && !t.language && (
                        <span className="text-text-muted ml-1">^^{shorten(t.datatype, prefixes)}</span>
                      )}
                    </span>
                  ) : t.objectType === 'blank' ? (
                    <span className="text-text-muted">_:{t.object}</span>
                  ) : (
                    <span className="text-accent-blue truncate block" title={t.object}>
                      {fmt(t.object)}
                    </span>
                  )}
                </td>
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
