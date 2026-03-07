import { useRdfStore } from '../../store/rdfStore'
import { useDomainStore } from '../../store/domainStore'

export default function StatusBar() {
  const store = useRdfStore((s) => s.store)
  const prefixes = useRdfStore((s) => s.prefixes)
  const parseError = useRdfStore((s) => s.parseError)
  const isParsing = useRdfStore((s) => s.isParsing)
  const activeDomainId = useDomainStore((s) => s.activeDomainId)
  const registeredDomains = useDomainStore((s) => s.registeredDomains)

  const prefixCount = Object.keys(prefixes).length
  const domainLabel = registeredDomains.get(activeDomainId)?.label ?? activeDomainId

  return (
    <div className="flex items-center gap-4 px-4 py-1 border-t border-surface-raised text-[11px] text-text-muted bg-surface-alt">
      <span>
        Mode:{' '}
        <span className={activeDomainId === 'samm' ? 'text-accent-purple' : 'text-accent-blue'}>
          {domainLabel}
        </span>
      </span>
      <span>Triples: <span className="text-text-primary">{store.size}</span></span>
      <span>Prefixes: <span className="text-text-primary">{prefixCount}</span></span>
      {isParsing && <span className="text-accent-yellow">Parsing…</span>}
      {!isParsing && parseError && (
        <span className="text-accent-red truncate">⚠ {parseError}</span>
      )}
      {!isParsing && !parseError && store.size > 0 && (
        <span className="text-accent-green">✓ Valid Turtle</span>
      )}
    </div>
  )
}
