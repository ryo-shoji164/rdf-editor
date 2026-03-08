import { describe, it, expect, beforeEach } from 'vitest'
import type { DomainPlugin } from '../../../types/domain'
import {
  registerPlugin,
  unregisterPlugin,
  getPlugin,
  getAllPlugins,
  getActiveDomainId,
  setActiveDomainId,
  getActivePlugin,
  getActiveVocabulary,
  initializePlugins,
  resetRegistry,
} from '../registry'

const mockPlugin: DomainPlugin = {
  id: 'test',
  label: 'Test Domain',
  namespaces: { ex: 'http://example.org/' },
  templates: [
    {
      id: 'basic',
      label: 'Basic Example',
      description: 'A basic example',
      turtleContent: '<http://example.org/s> <http://example.org/p> "o" .',
    },
  ],
  vocabularyItems: [
    {
      iri: 'http://example.org/Thing',
      prefixedName: 'ex:Thing',
      label: 'Thing',
      kind: 'class',
      description: 'A test thing',
    },
  ],
}

beforeEach(() => {
  resetRegistry()
})

describe('Plugin Registry', () => {
  describe('registerPlugin / getPlugin', () => {
    it('registers and retrieves a plugin', () => {
      registerPlugin(mockPlugin)
      expect(getPlugin('test')).toBe(mockPlugin)
    })

    it('returns undefined for unregistered id', () => {
      expect(getPlugin('nonexistent')).toBeUndefined()
    })

    it('overwrites plugin with same id', () => {
      registerPlugin(mockPlugin)
      const updated = { ...mockPlugin, label: 'Updated' }
      registerPlugin(updated)
      expect(getPlugin('test')?.label).toBe('Updated')
    })
  })

  describe('unregisterPlugin', () => {
    it('removes a registered plugin', () => {
      registerPlugin(mockPlugin)
      unregisterPlugin('test')
      expect(getPlugin('test')).toBeUndefined()
    })

    it('does nothing for unknown id', () => {
      unregisterPlugin('unknown')
      expect(getAllPlugins()).toHaveLength(0)
    })
  })

  describe('getAllPlugins', () => {
    it('returns all registered plugins', () => {
      registerPlugin(mockPlugin)
      registerPlugin({ ...mockPlugin, id: 'other', label: 'Other' })
      expect(getAllPlugins()).toHaveLength(2)
    })

    it('returns empty array when no plugins registered', () => {
      expect(getAllPlugins()).toHaveLength(0)
    })
  })

  describe('active domain', () => {
    it('defaults to free', () => {
      expect(getActiveDomainId()).toBe('free')
    })

    it('can be changed', () => {
      setActiveDomainId('samm')
      expect(getActiveDomainId()).toBe('samm')
    })

    it('getActivePlugin returns the active domain plugin', () => {
      registerPlugin(mockPlugin)
      setActiveDomainId('test')
      expect(getActivePlugin()).toBe(mockPlugin)
    })

    it('getActivePlugin returns undefined for unregistered active id', () => {
      setActiveDomainId('nonexistent')
      expect(getActivePlugin()).toBeUndefined()
    })
  })

  describe('getActiveVocabulary', () => {
    it('returns vocabulary items of active plugin', () => {
      registerPlugin(mockPlugin)
      setActiveDomainId('test')
      const vocab = getActiveVocabulary()
      expect(vocab).toHaveLength(1)
      expect(vocab![0].prefixedName).toBe('ex:Thing')
    })

    it('returns empty array when no active plugin', () => {
      expect(getActiveVocabulary()).toEqual([])
    })
  })

  describe('initializePlugins', () => {
    it('registers free and samm plugins', () => {
      initializePlugins()
      const plugins = getAllPlugins()
      expect(plugins).toHaveLength(2)
      expect(getPlugin('free')).toBeDefined()
      expect(getPlugin('samm')).toBeDefined()
    })

    it('sets active domain to free', () => {
      initializePlugins()
      expect(getActiveDomainId()).toBe('free')
    })

    it('free plugin has FOAF template', () => {
      initializePlugins()
      const free = getPlugin('free')!
      expect(free.templates).toHaveLength(1)
      expect(free.templates[0].id).toBe('foaf-graph')
      expect(free.templates[0].turtleContent).toContain('foaf:Person')
    })

    it('samm plugin has vocabulary items', () => {
      initializePlugins()
      const samm = getPlugin('samm')!
      expect(samm.vocabularyItems!.length).toBeGreaterThan(0)
      const aspect = samm.vocabularyItems!.find((v) => v.label === 'Aspect')
      expect(aspect).toBeDefined()
      expect(aspect!.kind).toBe('class')
    })

    it('samm plugin has graph styles', () => {
      initializePlugins()
      const samm = getPlugin('samm')!
      expect(samm.graphStyles).toBeDefined()
      expect(samm.graphStyles!.length).toBeGreaterThan(0)
    })
  })
})
