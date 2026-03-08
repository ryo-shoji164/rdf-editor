import { useState } from 'react'

interface AddEdgeDialogProps {
  isOpen: boolean
  sourceNodeId: string | null
  onClose: () => void
  onSubmit: (predicate: string, object: string, isLiteral: boolean) => void
}

export default function AddEdgeDialog({
  isOpen,
  sourceNodeId,
  onClose,
  onSubmit,
}: AddEdgeDialogProps) {
  const [predicate, setPredicate] = useState('http://example.org/predicate')
  const [object, setObject] = useState('')
  const [isLiteral, setIsLiteral] = useState(false)

  const handleCloseWrapper = () => {
    setPredicate('http://example.org/predicate')
    setObject('')
    setIsLiteral(false)
    onClose()
  }

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!predicate.trim() || !object.trim()) return
    onSubmit(predicate.trim(), object.trim(), isLiteral)
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
          <h2 className="text-lg font-medium text-text-primary">Add Edge (Triple)</h2>
          <button onClick={handleCloseWrapper} className="text-text-muted hover:text-text-primary">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-sm bg-editor p-3 rounded border border-surface-raised mb-4">
            <span className="text-text-secondary">Source (Subject):</span>
            <div className="font-mono text-accent-cyan break-all mt-1">{displaySource}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Predicate (Property/Edge) <span className="text-accent-blue">*</span>
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
                Object (Target) <span className="text-accent-blue">*</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLiteral}
                  onChange={(e) => setIsLiteral(e.target.checked)}
                  className="rounded border-surface-raised bg-editor text-accent-blue focus:ring-accent-blue focus:ring-offset-surface"
                />
                Is Literal Value
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={!predicate.trim() || !object.trim()}
              className="px-4 py-2 rounded text-sm font-medium bg-accent-blue text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Edge
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
