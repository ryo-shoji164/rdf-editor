import { create } from 'zustand'
import { useRdfStore } from './rdfStore'
import { setVocabulary } from '../lib/editor/completionProvider'
import { getPlugin } from '../lib/domains/registry'

/**
 * Lightweight domain template definition.
 * Will be replaced by the full DomainPlugin interface in R-2.
 */
export interface DomainTemplate {
  id: string
  label: string
  turtleContent: string
}

export interface DomainInfo {
  id: string
  label: string
  templates: DomainTemplate[]
}

export interface DomainState {
  /** Currently active domain ID. 'free' is the default. */
  activeDomainId: string
  /** Registered domain definitions, keyed by domain ID. */
  registeredDomains: Map<string, DomainInfo>

  registerDomain: (domain: DomainInfo) => void
  setActiveDomain: (id: string) => void
  loadTemplate: (domainId: string, templateId: string) => void
}

export const useDomainStore = create<DomainState>((set, get) => ({
  activeDomainId: 'free',
  registeredDomains: new Map(),

  registerDomain: (domain) => {
    set((state) => {
      const updated = new Map(state.registeredDomains)
      updated.set(domain.id, domain)
      return { registeredDomains: updated }
    })
  },

  setActiveDomain: (id) => {
    const plugin = getPlugin(id)
    if (plugin && plugin.vocabularyItems) {
      setVocabulary(plugin.vocabularyItems)
    } else {
      setVocabulary([])
    }
    set({ activeDomainId: id })
  },

  loadTemplate: (domainId, templateId) => {
    const domain = get().registeredDomains.get(domainId)
    if (!domain) return
    const template = domain.templates.find((t) => t.id === templateId)
    if (!template) return

    // Update the RDF store with the template content
    const rdfStore = useRdfStore.getState()
    rdfStore.setTurtleText(template.turtleContent)
    rdfStore.reparseNow()

    // Update vocabulary for auto-completion based on the plugin
    const plugin = getPlugin(domainId)
    if (plugin && plugin.vocabularyItems) {
      setVocabulary(plugin.vocabularyItems)
    } else {
      setVocabulary([])
    }

    set({ activeDomainId: domainId })
  },
}))
