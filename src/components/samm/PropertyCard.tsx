import type { SammProperty } from '../../types/rdf'
import { SAMM_C_NS } from '../../lib/samm/vocabulary'

interface Props {
  property: SammProperty
}

function localName(iri: string) {
  const sep = Math.max(iri.lastIndexOf('#'), iri.lastIndexOf('/'))
  return sep >= 0 ? iri.slice(sep + 1) : iri
}

function charColor(type?: string): string {
  if (!type) return 'text-text-muted'
  switch (type) {
    case 'Measurement': return 'text-accent-orange'
    case 'Quantifiable': return 'text-accent-orange'
    case 'Boolean': return 'text-accent-purple'
    case 'Enumeration':
    case 'State': return 'text-accent-yellow'
    case 'Collection':
    case 'Set':
    case 'List':
    case 'SortedSet': return 'text-accent-cyan'
    case 'SingleEntity': return 'text-accent-green'
    default: return 'text-accent-blue'
  }
}

export default function PropertyCard({ property }: Props) {
  const char = property.characteristic
  const charName = char
    ? char.iri.startsWith(SAMM_C_NS)
      ? char.iri.slice(SAMM_C_NS.length)
      : localName(char.iri)
    : undefined

  return (
    <div className="rounded border border-surface-raised bg-surface p-2.5 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-accent-blue font-medium text-[11px]">
          {localName(property.iri)}
        </span>
        {property.optional && (
          <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded-full bg-surface-raised">
            optional
          </span>
        )}
      </div>

      {property.preferredName && (
        <div className="text-[10px] text-text-muted">{property.preferredName}</div>
      )}

      {char && (
        <div className={`text-[10px] ${charColor(charName)}`}>
          {charName ?? localName(char.iri)}
          {char.dataType && (
            <span className="text-text-muted ml-1">· {localName(char.dataType)}</span>
          )}
          {char.unit && (
            <span className="text-text-muted ml-1">· {localName(char.unit)}</span>
          )}
        </div>
      )}

      {property.exampleValue && (
        <div className="text-[10px] text-text-muted">
          Example: <span className="text-accent-yellow">{property.exampleValue}</span>
        </div>
      )}
    </div>
  )
}
