/**
 * Register built-in domains (Free/FOAF and SAMM) into the domain store.
 * Called once at app startup from main.tsx.
 */
import { useDomainStore } from './domainStore'
import { useRdfStore } from './rdfStore'
import { FOAF_EXAMPLE, SAMM_EXAMPLE } from '../lib/samm/templates'
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

export function initializeDomains() {
    const domainStore = useDomainStore.getState()
    domainStore.registerDomain(FREE_DOMAIN)
    domainStore.registerDomain(SAMM_DOMAIN)

    // Load default content and trigger initial parse
    const rdfStore = useRdfStore.getState()
    rdfStore.setTurtleText(FOAF_EXAMPLE)
    rdfStore.reparseNow()
}
