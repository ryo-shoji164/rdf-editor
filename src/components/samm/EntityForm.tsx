import type { SammEntity } from '../../types/rdf'
import PropertyCard from './PropertyCard'

interface Props {
  entity: SammEntity
}

function localName(iri: string) {
  const sep = Math.max(iri.lastIndexOf('#'), iri.lastIndexOf('/'))
  return sep >= 0 ? iri.slice(sep + 1) : iri
}

export default function EntityForm({ entity }: Props) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-accent-cyan">{localName(entity.iri)}</div>
          <div className="text-[10px] text-text-muted font-mono truncate max-w-xs" title={entity.iri}>
            {entity.iri}
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-raised text-text-muted">
          samm:Entity
        </span>
      </div>

      {(entity.preferredName || entity.description) && (
        <div className="space-y-1 text-[11px]">
          {entity.preferredName && (
            <div>
              <span className="text-text-muted">Preferred name: </span>
              <span className="text-text-primary">{entity.preferredName}</span>
            </div>
          )}
          {entity.description && (
            <div>
              <span className="text-text-muted">Description: </span>
              <span className="text-text-primary">{entity.description}</span>
            </div>
          )}
        </div>
      )}

      {entity.extends && (
        <div className="text-[11px]">
          <span className="text-text-muted">Extends: </span>
          <span className="text-accent-green">{localName(entity.extends)}</span>
        </div>
      )}

      <div>
        <div className="text-[11px] font-medium text-text-primary mb-2">
          Properties ({entity.properties.length})
        </div>
        <div className="space-y-2">
          {entity.properties.map((prop) => (
            <PropertyCard key={prop.iri} property={prop} />
          ))}
          {entity.properties.length === 0 && (
            <div className="text-[11px] text-text-muted italic py-2">No properties defined.</div>
          )}
        </div>
      </div>
    </div>
  )
}
