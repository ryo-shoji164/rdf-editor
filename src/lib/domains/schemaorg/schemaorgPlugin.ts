import type { DomainPlugin, DomainTemplate } from '../../types/domain'
import {
  ARTICLE_TEMPLATE,
  PRODUCT_TEMPLATE,
  LOCAL_BUSINESS_TEMPLATE,
  EVENT_TEMPLATE,
  PERSON_TEMPLATE,
  FAQ_PAGE_TEMPLATE,
} from './templates'

const templates: DomainTemplate[] = [
  {
    id: 'schema-article',
    label: 'Article',
    description: 'News or blog post template',
    turtleContent: ARTICLE_TEMPLATE,
  },
  {
    id: 'schema-product',
    label: 'Product',
    description: 'Product or service template',
    turtleContent: PRODUCT_TEMPLATE,
  },
  {
    id: 'schema-localbusiness',
    label: 'LocalBusiness',
    description: 'Physical business or branch template',
    turtleContent: LOCAL_BUSINESS_TEMPLATE,
  },
  {
    id: 'schema-event',
    label: 'Event',
    description: 'Scheduled event template',
    turtleContent: EVENT_TEMPLATE,
  },
  {
    id: 'schema-person',
    label: 'Person',
    description: 'Individual person template',
    turtleContent: PERSON_TEMPLATE,
  },
  {
    id: 'schema-faqpage',
    label: 'FAQPage',
    description: 'Frequently Asked Questions template',
    turtleContent: FAQ_PAGE_TEMPLATE,
  },
]

export const schemaorgPlugin: DomainPlugin = {
  id: 'schemaorg',
  label: 'Schema.org',
  namespaces: {
    schema: 'http://schema.org/',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
  },
  templates,
}
