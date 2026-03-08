/**
 * Register built-in domains (Free/FOAF and SAMM) into the domain store.
 * Called once at app startup from main.tsx.
 */
import { useDomainStore } from './domainStore'
import { useRdfStore } from './rdfStore'
import { FOAF_EXAMPLE, SAMM_EXAMPLE } from '../lib/samm/templates'
import { schemaorgPlugin } from '../lib/schemaorg/schemaorgPlugin'
import { bimPlugin } from '../lib/domains/bim/plugin'
import { smartcityPlugin } from '../lib/domains/smartcity/plugin'
import type { DomainInfo } from './domainStore'

const FREE_DOMAIN: DomainInfo = {
  id: 'free',
  label: 'Free',
  templates: [
    {
      id: 'foaf',
      label: 'FOAF Graph',
      turtleContent: FOAF_EXAMPLE,
    },
  ],
}

const SAMM_DOMAIN: DomainInfo = {
  id: 'samm',
  label: 'SAMM',
  templates: [
    {
      id: 'samm-basic',
      label: 'SAMM Aspect',
      turtleContent: SAMM_EXAMPLE,
    },
  ],
}

const SCHEMA_ORG_DOMAIN: DomainInfo = {
  id: schemaorgPlugin.id,
  label: schemaorgPlugin.label,
  templates: schemaorgPlugin.templates.map((t) => ({
    id: t.id,
    label: t.label,
    turtleContent: t.turtleContent,
  })),
}

const BIM_DOMAIN: DomainInfo = {
  id: bimPlugin.id,
  label: bimPlugin.label,
  templates: bimPlugin.templates.map((t) => ({
    id: t.id,
    label: t.label,
    turtleContent: t.turtleContent,
  })),
}

const SMARTCITY_DOMAIN: DomainInfo = {
  id: smartcityPlugin.id,
  label: smartcityPlugin.label,
  templates: smartcityPlugin.templates.map((t) => ({
    id: t.id,
    label: t.label,
    turtleContent: t.turtleContent,
  })),
}

export function initializeDomains() {
  const domainStore = useDomainStore.getState()
  domainStore.registerDomain(FREE_DOMAIN)
  domainStore.registerDomain(SAMM_DOMAIN)
  domainStore.registerDomain(SCHEMA_ORG_DOMAIN)
  domainStore.registerDomain(BIM_DOMAIN)
  domainStore.registerDomain(SMARTCITY_DOMAIN)

  // Load default content and trigger initial parse
  const rdfStore = useRdfStore.getState()
  rdfStore.setTurtleText(FOAF_EXAMPLE)
  rdfStore.reparseNow()
}
