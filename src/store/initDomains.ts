/**
 * Register built-in domains (Free/FOAF and SAMM) into the domain store.
 * Called once at app startup from main.tsx.
 */
import { useDomainStore } from './domainStore'
import { useRdfStore } from './rdfStore'
import { FOAF_EXAMPLE } from '../lib/samm/templates'
import { initializePlugins, getAllPlugins } from '../lib/domains/registry'

export function initializeDomains() {
  const domainStore = useDomainStore.getState()

  // First, initialize the plugin registry
  initializePlugins()

  // Then map each plugin to a DomainInfo and register it in the domain store
  const plugins = getAllPlugins()
  for (const plugin of plugins) {
    domainStore.registerDomain({
      id: plugin.id,
      label: plugin.label,
      templates: plugin.templates.map((t) => ({
        id: t.id,
        label: t.label,
        turtleContent: t.turtleContent,
      })),
    })
  }

  // Load default content and trigger initial parse
  const rdfStore = useRdfStore.getState()
  rdfStore.setTurtleText(FOAF_EXAMPLE)
  rdfStore.reparseNow()
}
