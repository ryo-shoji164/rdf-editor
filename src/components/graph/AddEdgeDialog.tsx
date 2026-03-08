import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface AddEdgeDialogProps {
  isOpen: boolean
  sourceNodeId: string | null
  onClose: () => void
  onSubmit: (subject: string, predicate: string, object: string, isLiteral: boolean) => void
}

export default function AddEdgeDialog({
  isOpen,
  sourceNodeId,
  onClose,
  onSubmit,
}: AddEdgeDialogProps) {
  const { t } = useTranslation()
  const [subject, setSubject] = useState(sourceNodeId || 'http://example.org/SubjectNode')
  const [predicate, setPredicate] = useState('http://example.org/predicate')

  const [object, setObject] = useState('')
  const [isLiteral, setIsLiteral] = useState(false)

  const handleCloseWrapper = () => {
    setSubject(sourceNodeId || 'http://example.org/SubjectNode')
    setPredicate('http://example.org/predicate')
    setObject('')
    setIsLiteral(false)
    onClose()
  }

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalSubject = sourceNodeId || subject
    if (!finalSubject.trim() || !predicate.trim() || !object.trim()) return
    onSubmit(finalSubject.trim(), predicate.trim(), object.trim(), isLiteral)
    handleCloseWrapper()
  }

  // Display-friendly source node ID
  const displaySource =
    sourceNodeId?.length && sourceNodeId.length > 40
      ? `${sourceNodeId.slice(0, 20)}...${sourceNodeId.slice(-15)}`
      : sourceNodeId

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface border border-surface-raised rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-raised flex justify-between items-center bg-surface-raised/30">
          <h2 className="text-lg font-medium text-text-primary">{t('dialogs.addEdge.title')}</h2>
          <button onClick={handleCloseWrapper} className="text-text-muted hover:text-text-primary">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Source Node */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('dialogs.addEdge.fromNode')}
            </label>
            {sourceNodeId ? (
              <div className="w-full bg-surface-alt text-text-muted border border-surface-raised rounded px-3 py-2 text-sm font-mono break-all">
                {displaySource}
              </div>
            ) : (
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-editor text-text-primary border border-surface-raised rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue font-mono"
                placeholder="http://example.org/SubjectNode"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('dialogs.addEdge.predicateLabel')} <span className="text-accent-blue">*</span>
            </label>
            <input
              type="text"
              required
              value={predicate}
              onChange={(e) => setPredicate(e.target.value)}
              className="w-full bg-editor text-text-primary border border-surface-raised rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue font-mono"
              placeholder="http://example.org/knows or ex:knows"
            />
          </div>

          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-sm font-medium text-text-secondary">
                {t('dialogs.addEdge.objValue')} <span className="text-accent-blue">*</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLiteral}
                  onChange={(e) => setIsLiteral(e.target.checked)}
                  className="rounded border-surface-raised bg-editor text-accent-blue focus:ring-accent-blue focus:ring-offset-surface"
                />
                {t('dialogs.addEdge.literalObj')}
              </label>
            </div>
            <input
              type="text"
              required
              value={object}
              onChange={(e) => setObject(e.target.value)}
              className={`w-full bg-editor text-text-primary border border-surface-raised rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue ${!isLiteral ? 'font-mono' : ''}`}
              placeholder={isLiteral ? '"John Doe"' : 'http://example.org/Person'}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseWrapper}
              className="px-4 py-2 rounded text-sm font-medium text-text-secondary hover:bg-surface-raised"
            >
              {t('dialogs.addEdge.cancel')}
            </button>
            <button
              type="submit"
              disabled={!(sourceNodeId || subject.trim()) || !predicate.trim() || !object.trim()}
              className="px-4 py-2 rounded text-sm font-medium bg-accent-blue text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('dialogs.addEdge.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
