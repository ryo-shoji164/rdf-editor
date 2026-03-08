import type { DomainPlugin, DomainTemplate } from '../../../types/domain'
import { NGSI_LD_TEMPLATE } from './templates'

const templates: DomainTemplate[] = [
  {
    id: 'ngsi-ld-entity',
    label: 'NGSI-LD Entity',
    description: 'Smart City NGSI-LD Entity template',
    turtleContent: NGSI_LD_TEMPLATE,
  },
]

export const smartcityPlugin: DomainPlugin = {
  id: 'smartcity',
  label: 'Smart City (NGSI-LD)',
  namespaces: {
    'ngsi-ld': 'https://uri.etsi.org/ngsi-ld/',
    schema: 'http://schema.org/',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
  },
  templates,
}
