import { useEffect, useRef } from 'react'
import { Plus, Link2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export type ContextMenuTargetType = 'bg' | 'node' | null

interface GraphContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  targetType: ContextMenuTargetType
  targetId?: string
  onClose: () => void
  onAddNode: (position: { x: number; y: number }) => void
  onAddEdgeFromCurrent: (sourceNodeId: string) => void
}

export default function GraphContextMenu({
  isOpen,
  position,
  targetType,
  targetId,
  onAddNode,
  onAddEdgeFromCurrent,
  onClose,
}: GraphContextMenuProps) {
  const { t } = useTranslation()
  const menuRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return
    const handleGlobalClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Use a slight delay to prevent immediate firing from the opening click bubbling up
    // In headless test environments, event bubbling can take longer, triggering immediate close.
    const timerId = setTimeout(() => {
      document.addEventListener('click', handleGlobalClick)
      document.addEventListener('contextmenu', handleGlobalClick)
    }, 150)

    return () => {
      clearTimeout(timerId)
      document.removeEventListener('click', handleGlobalClick)
      document.removeEventListener('contextmenu', handleGlobalClick)
    }
  }, [isOpen, onClose])

  if (!isOpen || !targetType) return null

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-surface border border-surface-raised rounded-md shadow-lg py-1 min-w-[150px] text-sm"
      style={{ top: position.y, left: position.x }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {targetType === 'bg' && (
        <button
          onClick={() => {
            onAddNode(position)
            onClose()
          }}
          className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-raised flex items-center gap-2 group transition-colors"
        >
          <Plus size={14} className="text-text-muted group-hover:text-text-primary" />
          {t('contextMenu.addNode')}
        </button>
      )}

      {targetType === 'node' && (
        <button
          onClick={() => {
            if (targetId) {
              onAddEdgeFromCurrent(targetId)
            }
            onClose()
          }}
          className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-raised flex items-center gap-2 group transition-colors"
        >
          <Link2 size={14} className="text-text-muted group-hover:text-text-primary" />
          {t('contextMenu.addEdge')}
        </button>
      )}
    </div>
  )
}
