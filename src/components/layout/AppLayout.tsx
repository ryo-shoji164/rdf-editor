import { useRef } from 'react'
import { Code2, Network, Table2, Columns2, FileDown, FileUp, Trash2, Layers } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRdfStore } from '../../store/rdfStore'
import { useUiStore, type ActiveView } from '../../store/uiStore'
import { useDomainStore } from '../../store/domainStore'
import TurtleEditor from '../editor/TurtleEditor'
import RdfGraph from '../graph/RdfGraph'
import TripleTable from '../table/TripleTable'
import SammPanel from '../samm/SammPanel'
import StatusBar from './StatusBar'
import TemplateMenu from './TemplateMenu'

const VIEW_BUTTONS: { id: ActiveView; icon: React.ReactNode }[] = [
  { id: 'editor', icon: <Code2 size={15} /> },
  { id: 'graph', icon: <Network size={15} /> },
  { id: 'table', icon: <Table2 size={15} /> },
  { id: 'split', icon: <Columns2 size={15} /> },
]

export default function AppLayout() {
  const { t, i18n } = useTranslation()

  const activeView = useUiStore((s) => s.activeView)
  const setActiveView = useUiStore((s) => s.setActiveView)

  const activeDomainId = useDomainStore((s) => s.activeDomainId)
  const registeredDomains = useDomainStore((s) => s.registeredDomains)
  const setActiveDomain = useDomainStore((s) => s.setActiveDomain)
  const importFile = useRdfStore((s) => s.importFile)
  const exportAs = useRdfStore((s) => s.exportAs)
  const clearAll = useRdfStore((s) => s.clearAll)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Convert Map to sorted array for rendering
  const domainList = Array.from(registeredDomains.values())

  function handleFileOpen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target?.result as string
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext === 'jsonld' || ext === 'json') {
        importFile(content, 'jsonld')
      } else if (ext === 'nt') {
        importFile(content, 'n-triples')
      } else {
        importFile(content, 'turtle')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function renderMainContent() {
    if (activeDomainId === 'samm') {
      return (
        <div className="flex h-full">
          <div className="w-1/2 border-r border-surface-raised overflow-hidden flex flex-col">
            <TurtleEditor />
          </div>
          <div className="w-1/2 overflow-hidden">
            <SammPanel />
          </div>
        </div>
      )
    }
    if (activeView === 'split') {
      return (
        <div className="flex h-full">
          <div className="w-1/2 border-r border-surface-raised overflow-hidden">
            <TurtleEditor />
          </div>
          <div className="w-1/2 overflow-hidden">
            <RdfGraph />
          </div>
        </div>
      )
    }
    if (activeView === 'editor') return <TurtleEditor />
    if (activeView === 'graph') return <RdfGraph />
    return <TripleTable />
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface">
      {/* Toolbar */}
      <header className="flex items-center gap-1 px-3 py-1.5 border-b border-surface-raised bg-surface-alt shrink-0">
        {/* App name */}
        <div className="flex items-center gap-1.5 mr-3">
          <Layers size={16} className="text-accent-purple" />
          <span className="text-sm font-medium text-text-primary">{t('layout.title')}</span>
        </div>

        {/* Mode toggle — dynamically generated from registered domains */}
        <div className="flex rounded overflow-hidden border border-surface-raised mr-2">
          {domainList.map((domain) => (
            <button
              key={domain.id}
              onClick={() => setActiveDomain(domain.id)}
              className={`px-3 py-1 text-xs capitalize transition-colors ${
                activeDomainId === domain.id
                  ? domain.id === 'samm'
                    ? 'bg-accent-purple text-surface font-medium'
                    : 'bg-accent-blue text-surface font-medium'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-raised'
              }`}
            >
              {domain.label}
            </button>
          ))}
        </div>

        {/* View toggle (hidden in SAMM mode) */}
        {activeDomainId !== 'samm' && (
          <div className="flex rounded overflow-hidden border border-surface-raised mr-2">
            {VIEW_BUTTONS.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setActiveView(btn.id)}
                title={t(`layout.${btn.id}`)}
                className={`px-2.5 py-1 flex items-center gap-1 text-xs transition-colors ${
                  activeView === btn.id
                    ? 'bg-surface-raised text-text-primary'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-raised'
                }`}
              >
                {btn.icon}
                <span className="hidden sm:inline">{t(`layout.${btn.id}`)}</span>
              </button>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-1">
          {/* Examples — dynamically generated from registered domains */}
          <TemplateMenu />

          {/* Language Switcher */}
          <button
            onClick={() => i18n.changeLanguage(i18n.language.startsWith('ja') ? 'en' : 'ja')}
            title="Toggle Language"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-text-muted hover:text-text-primary hover:bg-surface-raised rounded mr-1"
          >
            {i18n.language.startsWith('ja') ? 'EN' : 'JA'}
          </button>

          {/* Import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".ttl,.turtle,.nt,.nq,.jsonld,.json"
            onChange={handleFileOpen}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title={t('layout.open')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-text-muted hover:text-text-primary hover:bg-surface-raised rounded"
          >
            <FileUp size={13} />
            <span className="hidden sm:inline">{t('layout.open')}</span>
          </button>

          {/* Export */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-2.5 py-1 text-xs text-text-muted hover:text-text-primary hover:bg-surface-raised rounded">
              <FileDown size={13} />
              <span className="hidden sm:inline">{t('layout.export')}</span>
            </button>
            <div className="hidden group-hover:flex flex-col absolute right-0 top-full mt-1 bg-surface-raised border border-surface-raised rounded shadow-lg z-50 min-w-36">
              <button
                onClick={() => exportAs('turtle')}
                className="px-3 py-2 text-xs text-left hover:bg-surface text-text-primary"
              >
                Turtle (.ttl)
              </button>
              <button
                onClick={() => exportAs('n-triples')}
                className="px-3 py-2 text-xs text-left hover:bg-surface text-text-primary"
              >
                N-Triples (.nt)
              </button>
              <button
                onClick={() => exportAs('jsonld')}
                className="px-3 py-2 text-xs text-left hover:bg-surface text-text-primary"
              >
                JSON-LD (.jsonld)
              </button>
            </div>
          </div>

          {/* Clear */}
          <button
            onClick={clearAll}
            title={t('layout.clearAll')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-text-muted hover:text-accent-red hover:bg-surface-raised rounded"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">{renderMainContent()}</main>

      <StatusBar />
    </div>
  )
}
