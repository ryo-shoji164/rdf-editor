import { useState } from 'react'
import { TYPE_COLORS } from './graphUtils'

/** Base node type colors (always shown) */
const BASE_TYPES = [
  { label: 'IRI Node', color: '#89b4fa', bg: '#1e1e2e', shape: 'ellipse' as const },
  { label: 'Blank Node', color: '#6c7086', bg: '#1e1e2e', shape: 'ellipse' as const },
  { label: 'Literal', color: '#f9e2af', bg: '#313244', shape: 'rectangle' as const },
]

export default function GraphLegend() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="absolute bottom-3 left-3 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 rounded text-xs bg-surface-raised hover:bg-surface text-text-primary border border-surface-raised"
        title="Toggle legend"
      >
        {isOpen ? '◀ Legend' : '▶ Legend'}
      </button>

      {isOpen && (
        <div className="mt-1 p-3 rounded-lg bg-[#1e1e2e] border border-[#45475a] shadow-xl max-h-64 overflow-y-auto min-w-[180px]">
          {/* Base node types */}
          <div className="text-[10px] text-[#6c7086] uppercase tracking-wider mb-1.5 font-semibold">
            Node Types
          </div>
          {BASE_TYPES.map((t) => (
            <div key={t.label} className="flex items-center gap-2 mb-1">
              <span
                className="inline-block w-3.5 h-2.5 border-2 shrink-0"
                style={{
                  backgroundColor: t.bg,
                  borderColor: t.color,
                  borderRadius: t.shape === 'ellipse' ? '50%' : '2px',
                }}
              />
              <span className="text-[11px] text-[#cdd6f4]">{t.label}</span>
            </div>
          ))}

          {/* rdf:type colors */}
          <div className="text-[10px] text-[#6c7086] uppercase tracking-wider mt-2.5 mb-1.5 font-semibold">
            rdf:type
          </div>
          {Object.entries(TYPE_COLORS).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-2 mb-1">
              <span
                className="inline-block w-3.5 h-2.5 rounded-full border-2 shrink-0"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                }}
              />
              <span className="text-[11px] text-[#cdd6f4]">{colors.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
