import { useAppStore } from '../../store/appStore'

export default function StatusBar() {
  const store = useAppStore((s) => s.store)
  const prefixes = useAppStore((s) => s.prefixes)
  const parseError = useAppStore((s) => s.parseError)
  const isParsing = useAppStore((s) => s.isParsing)
  const mode = useAppStore((s) => s.mode)

  const prefixCount = Object.keys(prefixes).length

  return (
    <div className="flex items-center gap-4 px-4 py-1 border-t border-surface-raised text-[11px] text-text-muted bg-surface-alt">
      <span>
        Mode:{' '}
        <span className={mode === 'samm' ? 'text-accent-purple' : 'text-accent-blue'}>
          {mode === 'samm' ? 'SAMM' : 'Free'}
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
