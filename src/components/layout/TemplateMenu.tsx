import { BookOpen, ChevronRight } from 'lucide-react'
import { useDomainStore } from '../../store/domainStore'

export default function TemplateMenu() {
  const registeredDomains = useDomainStore((s) => s.registeredDomains)
  const loadTemplate = useDomainStore((s) => s.loadTemplate)

  const domainList = Array.from(registeredDomains.values()).filter((d) => d.templates.length > 0)

  return (
    <div className="relative group">
      <button className="flex items-center gap-1 px-2.5 py-1 text-xs text-text-muted hover:text-text-primary hover:bg-surface-raised rounded">
        <BookOpen size={13} />
        <span className="hidden sm:inline">Examples</span>
      </button>
      <div className="hidden group-hover:flex flex-col absolute right-0 top-full mt-1 bg-surface-raised border border-surface-raised rounded shadow-lg z-50 min-w-44">
        {domainList.map((domain) => (
          <div key={domain.id} className="relative group/sub">
            <div className="flex items-center justify-between px-3 py-2 text-xs text-text-primary hover:bg-surface cursor-default">
              <span className="font-medium">{domain.label}</span>
              {domain.templates.length > 1 && (
                <ChevronRight size={11} className="text-text-muted" />
              )}
            </div>
            {domain.templates.length === 1 ? (
              <button
                onClick={() => loadTemplate(domain.id, domain.templates[0].id)}
                className="w-full px-5 py-1.5 text-xs text-left hover:bg-surface text-text-muted"
              >
                {domain.templates[0].label}
              </button>
            ) : (
              domain.templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => loadTemplate(domain.id, tmpl.id)}
                  className="w-full px-5 py-1.5 text-xs text-left hover:bg-surface text-text-muted"
                >
                  {tmpl.label}
                </button>
              ))
            )}
            {domain.id !== domainList[domainList.length - 1].id && (
              <div className="border-b border-surface mx-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
