import { describe, it, expect, beforeEach } from 'vitest'
import * as N3 from 'n3'
import { useDomainStore } from '../domainStore'
import { useRdfStore } from '../rdfStore'
import type { DomainInfo } from '../domainStore'

const TEST_DOMAIN: DomainInfo = {
  id: 'test-domain',
  label: 'Test Domain',
  templates: [
    {
      id: 'tmpl-1',
      label: 'Test Template',
      turtleContent: '@prefix ex: <http://example.org/> .\nex:test a ex:Thing .',
    },
    {
      id: 'tmpl-2',
      label: 'Another Template',
      turtleContent: '@prefix ex: <http://example.org/> .\nex:other a ex:Widget .',
    },
  ],
}

beforeEach(() => {
  useDomainStore.setState({
    activeDomainId: 'free',
    registeredDomains: new Map(),
  })
  useRdfStore.setState({
    turtleText: '',
    store: new N3.Store(),
    prefixes: {},
    parseError: null,
    isParsing: false,
  })
})

describe('domainStore', () => {
  describe('registerDomain', () => {
    it('registers a domain', () => {
      useDomainStore.getState().registerDomain(TEST_DOMAIN)
      const domains = useDomainStore.getState().registeredDomains
      expect(domains.has('test-domain')).toBe(true)
      expect(domains.get('test-domain')?.label).toBe('Test Domain')
    })

    it('registers multiple domains', () => {
      useDomainStore.getState().registerDomain(TEST_DOMAIN)
      useDomainStore.getState().registerDomain({
        id: 'other',
        label: 'Other',
        templates: [],
      })
      expect(useDomainStore.getState().registeredDomains.size).toBe(2)
    })

    it('overwrites domain with same id', () => {
      useDomainStore.getState().registerDomain(TEST_DOMAIN)
      useDomainStore.getState().registerDomain({
        ...TEST_DOMAIN,
        label: 'Updated Label',
      })
      const domain = useDomainStore.getState().registeredDomains.get('test-domain')
      expect(domain?.label).toBe('Updated Label')
    })
  })

  describe('setActiveDomain', () => {
    it('changes the active domain', () => {
      useDomainStore.getState().setActiveDomain('samm')
      expect(useDomainStore.getState().activeDomainId).toBe('samm')
    })
  })

  describe('loadTemplate', () => {
    it('loads template content into rdfStore', () => {
      useDomainStore.getState().registerDomain(TEST_DOMAIN)
      useDomainStore.getState().loadTemplate('test-domain', 'tmpl-1')

      expect(useRdfStore.getState().turtleText).toContain('ex:test')
      expect(useDomainStore.getState().activeDomainId).toBe('test-domain')
    })

    it('does nothing for unknown domain', () => {
      useDomainStore.getState().loadTemplate('nonexistent', 'tmpl-1')
      expect(useRdfStore.getState().turtleText).toBe('')
    })

    it('does nothing for unknown template', () => {
      useDomainStore.getState().registerDomain(TEST_DOMAIN)
      useDomainStore.getState().loadTemplate('test-domain', 'nonexistent')
      expect(useRdfStore.getState().turtleText).toBe('')
    })
  })
})
