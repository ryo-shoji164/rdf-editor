import { create } from 'zustand'
import type * as N3 from 'n3'
import { validateShacl } from '../lib/rdf/shaclValidator'

export interface ValidationResult {
  path: string
  message: string
  severity: 'error' | 'warning' | 'info'
  focusNode?: string
  line?: number
  column?: number
}

export interface ValidationState {
  results: ValidationResult[]
  isValidating: boolean
  shapesText: string
  violatingNodes: string[]

  setResults: (results: ValidationResult[]) => void
  clearResults: () => void
  setShapesText: (text: string) => void
  runValidation: (dataStore: N3.Store, turtleText: string) => Promise<void>
}

export const useValidationStore = create<ValidationState>((set, get) => ({
  results: [],
  isValidating: false,
  shapesText: '',
  violatingNodes: [],

  setResults: (results) => set({ results, isValidating: false }),
  clearResults: () => set({ results: [], isValidating: false, violatingNodes: [] }),

  setShapesText: (text) => set({ shapesText: text }),

  runValidation: async (dataStore, turtleText) => {
    const { shapesText } = get()
    if (!shapesText.trim()) {
      set({ results: [], isValidating: false, violatingNodes: [] })
      return
    }
    set({ isValidating: true })
    try {
      const report = await validateShacl(dataStore, shapesText, turtleText)
      set({
        results: report.results,
        violatingNodes: report.violatingNodes,
        isValidating: false,
      })
    } catch (err) {
      console.error('SHACL validation failed', err)
      set({ isValidating: false })
    }
  },
}))
