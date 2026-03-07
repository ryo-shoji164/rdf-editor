import { create } from 'zustand'

/**
 * Validation store — skeleton for future SHACL validation (B-3).
 */

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

    setResults: (results: ValidationResult[]) => void
    clearResults: () => void
}

export const useValidationStore = create<ValidationState>((set) => ({
    results: [],
    isValidating: false,

    setResults: (results) => set({ results, isValidating: false }),
    clearResults: () => set({ results: [], isValidating: false }),
}))
