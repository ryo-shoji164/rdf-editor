import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './appStore'

describe('appStore', () => {
    beforeEach(() => {
        useAppStore.getState().clearAll()
    })

    it('initially has empty state after clear', () => {
        const state = useAppStore.getState()
        expect(state.turtleText).toBe('')
        expect(state.store.size).toBe(0)
    })

    it('can load an example which updates text', async () => {
        useAppStore.getState().loadExample('samm')
        const state = useAppStore.getState()
        expect(state.turtleText).toContain('samm:Aspect')
        expect(state.mode).toBe('samm')
    })

    it('syncs text to store via parse', async () => {
        const turtle = `@prefix ex: <http://example.org/> . ex:A ex:B "C" .`
        useAppStore.getState().setTurtleText(turtle)
        await useAppStore.getState().reparseNow()
        const state = useAppStore.getState()
        expect(state.store.size).toBe(1)
        expect(state.prefixes).toHaveProperty('ex')
    })

    it('applyStoreChange updates turtle sequence', async () => {
        // Fill the store directly as if a UI action added a triple
        const store = useAppStore.getState().store
        const N3 = await import('n3')
        const { namedNode, literal } = N3.DataFactory
        store.add(N3.DataFactory.quad(
            namedNode('http://ex.org/S'),
            namedNode('http://ex.org/P'),
            literal('O')
        ))

        await useAppStore.getState().applyStoreChange()

        const state = useAppStore.getState()
        expect(state.turtleText).toContain('<http://ex.org/S>')
        expect(state.turtleText).toContain('<http://ex.org/P>')
        expect(state.turtleText).toContain('"O"')
    })
})
