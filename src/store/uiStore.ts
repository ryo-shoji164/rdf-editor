import { create } from 'zustand'

export type ActiveView = 'editor' | 'graph' | 'table' | 'split'

export interface UiState {
    activeView: ActiveView
    selectedNode: string | null

    setActiveView: (view: ActiveView) => void
    setSelectedNode: (iri: string | null) => void
}

export const useUiStore = create<UiState>((set) => ({
    activeView: 'split',
    selectedNode: null,

    setActiveView: (view) => set({ activeView: view }),
    setSelectedNode: (iri) => set({ selectedNode: iri }),
}))
