import { useEffect, useRef } from 'react'

export type ContextMenuTargetType = 'bg' | 'node' | null

interface GraphContextMenuProps {
  isOpen: boolean
  x: number
  y: number
  targetType: ContextMenuTargetType
  onClose: () => void
  onAddNode: () => void
  onAddEdge: () => void
}

export default function GraphContextMenu({
  isOpen,
  x,
  y,
  targetType,
  onClose,
  onAddNode,
  onAddEdge,
}: GraphContextMenuProps) {
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
      style={{ top: y, left: x }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {targetType === 'bg' && (
        <button
          className="w-full text-left px-4 py-2 hover:bg-surface-raised text-text-primary transition-colors"
          onClick={() => {
            onAddNode()
            onClose()
          }}
        >
          Add Node...
        </button>
      )}

      {targetType === 'node' && (
        <button
          className="w-full text-left px-4 py-2 hover:bg-surface-raised text-text-primary transition-colors"
          onClick={() => {
            onAddEdge()
            onClose()
          }}
        >
          Add Edge from Here...
        </button>
      )}
    </div>
  )
}
