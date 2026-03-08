/**
 * Schema.org Domain Plugin
 *
 * Provides Schema.org vocabulary, templates, SHACL validation shapes,
 * and graph styles for the RDF editor.
 */
import type { DomainPlugin, DomainTemplate } from '../../../types/domain'
import {
  ARTICLE_TEMPLATE,
  PRODUCT_TEMPLATE,
  LOCAL_BUSINESS_TEMPLATE,
  EVENT_TEMPLATE,
  PERSON_TEMPLATE,
  FAQ_PAGE_TEMPLATE,
} from './templates'
import { SCHEMAORG_VOCABULARY } from './vocabulary'
import { SCHEMAORG_SHACL_SHAPES } from './validator'

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
  vocabularyItems: SCHEMAORG_VOCABULARY,
  shaclShapes: SCHEMAORG_SHACL_SHAPES,
  graphStyles: [
    {
      selector: 'node[rdfType = "Person"]',
      style: {
        'background-color': '#1a2e4a',
        'border-color': '#89b4fa',
      },
    },
    {
      selector: 'node[rdfType = "Organization"]',
      style: {
        'background-color': '#1a3a2a',
        'border-color': '#a6e3a1',
      },
    },
    {
      selector: 'node[rdfType = "LocalBusiness"]',
      style: {
        'background-color': '#1a3a2a',
        'border-color': '#94e2d5',
      },
    },
    {
      selector: 'node[rdfType = "Article"]',
      style: {
        'background-color': '#3a2e1a',
        'border-color': '#fab387',
      },
    },
    {
      selector: 'node[rdfType = "BlogPosting"]',
      style: {
        'background-color': '#3a2e1a',
        'border-color': '#f9e2af',
      },
    },
    {
      selector: 'node[rdfType = "CreativeWork"]',
      style: {
        'background-color': '#3a2e1a',
        'border-color': '#e8b86d',
      },
    },
    {
      selector: 'node[rdfType = "Product"]',
      style: {
        'background-color': '#3a341a',
        'border-color': '#f9e2af',
      },
    },
    {
      selector: 'node[rdfType = "Offer"]',
      style: {
        'background-color': '#3a1a1a',
        'border-color': '#f38ba8',
      },
    },
    {
      selector: 'node[rdfType = "Event"]',
      style: {
        'background-color': '#2e1a4a',
        'border-color': '#cba6f7',
      },
    },
    {
      selector: 'node[rdfType = "Place"]',
      style: {
        'background-color': '#1a3a3a',
        'border-color': '#94e2d5',
      },
    },
    {
      selector: 'node[rdfType = "PostalAddress"]',
      style: {
        'background-color': '#1e3a2a',
        'border-color': '#74c7ec',
      },
    },
    {
      selector: 'node[rdfType = "AggregateRating"]',
      style: {
        'background-color': '#3a2a1a',
        'border-color': '#f9e2af',
      },
    },
  ],
}
