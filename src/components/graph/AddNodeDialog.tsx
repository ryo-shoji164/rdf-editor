import { useState } from 'react'

interface AddNodeDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (iri: string, label?: string) => void
}

export default function AddNodeDialog({ isOpen, onClose, onSubmit }: AddNodeDialogProps) {
  const [iri, setIri] = useState('http://example.org/NewNode')
  const [label, setLabel] = useState('')

  const handleCloseWrapper = () => {
    setIri('http://example.org/NewNode')
    setLabel('')
    onClose()
  }

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!iri.trim()) return
    onSubmit(iri.trim(), label.trim() || undefined)
    handleCloseWrapper()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface border border-surface-raised rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-raised flex justify-between items-center bg-surface-raised/30">
          <h2 className="text-lg font-medium text-text-primary">Add New Node</h2>
          <button onClick={handleCloseWrapper} className="text-text-muted hover:text-text-primary">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Node IRI <span className="text-accent-blue">*</span>
            </label>
            <input
              type="text"
              required
              value={iri}
              onChange={(e) => setIri(e.target.value)}
              className="w-full bg-editor text-text-primary border border-surface-raised rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
              placeholder="http://example.org/MyNode or ex:MyNode"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Label (rdfs:label){' '}
              <span className="text-text-muted text-xs font-normal">Optional</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-editor text-text-primary border border-surface-raised rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
              placeholder="Human readable display name"
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
              disabled={!iri.trim()}
              className="px-4 py-2 rounded text-sm font-medium bg-accent-blue text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Node
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
