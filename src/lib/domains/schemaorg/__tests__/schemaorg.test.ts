import { describe, it, expect } from 'vitest'
import { Parser } from 'n3'
import { schemaorgPlugin } from '../schemaorgPlugin'
import { SCHEMAORG_VOCABULARY } from '../vocabulary'
import { SCHEMAORG_SHACL_SHAPES } from '../validator'

describe('schemaorgPlugin', () => {
  it('has the correct id and label', () => {
    expect(schemaorgPlugin.id).toBe('schemaorg')
    expect(schemaorgPlugin.label).toBe('Schema.org')
  })

  it('includes schema: namespace', () => {
    expect(schemaorgPlugin.namespaces).toMatchObject({
      schema: 'http://schema.org/',
    })
  })

  it('has at least 6 templates', () => {
    expect(schemaorgPlugin.templates.length).toBeGreaterThanOrEqual(6)
  })

  it('all templates have unique ids', () => {
    const ids = schemaorgPlugin.templates.map((t) => t.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('all template turtleContent is valid Turtle', () => {
    for (const template of schemaorgPlugin.templates) {
      const parser = new Parser({ format: 'Turtle' })
      let error: Error | null = null
      try {
        parser.parse(template.turtleContent)
      } catch (e) {
        error = e as Error
      }
      expect(error, `Template "${template.id}" has invalid Turtle: ${error?.message}`).toBeNull()
    }
  })

  it('has vocabularyItems', () => {
    expect(schemaorgPlugin.vocabularyItems).toBeDefined()
    expect(schemaorgPlugin.vocabularyItems!.length).toBeGreaterThan(0)
  })

  it('has shaclShapes defined', () => {
    expect(schemaorgPlugin.shaclShapes).toBeDefined()
    expect(schemaorgPlugin.shaclShapes!.trim().length).toBeGreaterThan(0)
  })

  it('has graphStyles defined', () => {
    expect(schemaorgPlugin.graphStyles).toBeDefined()
    expect(schemaorgPlugin.graphStyles!.length).toBeGreaterThan(0)
  })
})

describe('SCHEMAORG_VOCABULARY', () => {
  it('contains class items', () => {
    const classes = SCHEMAORG_VOCABULARY.filter((v) => v.kind === 'class')
    expect(classes.length).toBeGreaterThan(0)
  })

  it('contains property items', () => {
    const properties = SCHEMAORG_VOCABULARY.filter((v) => v.kind === 'property')
    expect(properties.length).toBeGreaterThan(0)
  })

  it('contains individual items', () => {
    const individuals = SCHEMAORG_VOCABULARY.filter((v) => v.kind === 'individual')
    expect(individuals.length).toBeGreaterThan(0)
  })

  it('has key Schema.org classes', () => {
    const prefixedNames = SCHEMAORG_VOCABULARY.map((v) => v.prefixedName)
    expect(prefixedNames).toContain('schema:Thing')
    expect(prefixedNames).toContain('schema:Article')
    expect(prefixedNames).toContain('schema:Person')
    expect(prefixedNames).toContain('schema:Organization')
    expect(prefixedNames).toContain('schema:Product')
    expect(prefixedNames).toContain('schema:Event')
    expect(prefixedNames).toContain('schema:LocalBusiness')
    expect(prefixedNames).toContain('schema:Offer')
  })

  it('has key Schema.org properties', () => {
    const prefixedNames = SCHEMAORG_VOCABULARY.map((v) => v.prefixedName)
    expect(prefixedNames).toContain('schema:name')
    expect(prefixedNames).toContain('schema:description')
    expect(prefixedNames).toContain('schema:url')
    expect(prefixedNames).toContain('schema:image')
    expect(prefixedNames).toContain('schema:headline')
    expect(prefixedNames).toContain('schema:datePublished')
    expect(prefixedNames).toContain('schema:price')
    expect(prefixedNames).toContain('schema:priceCurrency')
    expect(prefixedNames).toContain('schema:startDate')
  })

  it('has correct iri prefix for all items', () => {
    for (const item of SCHEMAORG_VOCABULARY) {
      expect(item.iri).toMatch(/^http:\/\/schema\.org\//)
    }
  })

  it('all prefixedNames start with schema:', () => {
    for (const item of SCHEMAORG_VOCABULARY) {
      expect(item.prefixedName).toMatch(/^schema:/)
    }
  })

  it('class items have position object', () => {
    const classes = SCHEMAORG_VOCABULARY.filter((v) => v.kind === 'class')
    for (const cls of classes) {
      expect(cls.position).toBe('object')
    }
  })

  it('property items have position predicate', () => {
    const properties = SCHEMAORG_VOCABULARY.filter((v) => v.kind === 'property')
    for (const prop of properties) {
      expect(prop.position).toBe('predicate')
    }
  })

  it('all items have a description', () => {
    for (const item of SCHEMAORG_VOCABULARY) {
      expect(item.description).toBeDefined()
      expect(item.description!.length).toBeGreaterThan(0)
    }
  })

  it('has no duplicate prefixedNames', () => {
    const names = SCHEMAORG_VOCABULARY.map((v) => v.prefixedName)
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
  })
})

describe('SCHEMAORG_SHACL_SHAPES', () => {
  it('is a non-empty string', () => {
    expect(typeof SCHEMAORG_SHACL_SHAPES).toBe('string')
    expect(SCHEMAORG_SHACL_SHAPES.trim().length).toBeGreaterThan(0)
  })

  it('is valid Turtle syntax', () => {
    const parser = new Parser({ format: 'Turtle' })
    let error: Error | null = null
    try {
      parser.parse(SCHEMAORG_SHACL_SHAPES)
    } catch (e) {
      error = e as Error
    }
    expect(error, `SHACL shapes has invalid Turtle: ${error?.message}`).toBeNull()
  })

  it('declares sh:NodeShape entries', () => {
    expect(SCHEMAORG_SHACL_SHAPES).toContain('sh:NodeShape')
  })

  it('covers schema:Article', () => {
    expect(SCHEMAORG_SHACL_SHAPES).toContain('schema:Article')
  })

  it('covers schema:Person', () => {
    expect(SCHEMAORG_SHACL_SHAPES).toContain('schema:Person')
  })

  it('covers schema:Product', () => {
    expect(SCHEMAORG_SHACL_SHAPES).toContain('schema:Product')
  })

  it('covers schema:Event', () => {
    expect(SCHEMAORG_SHACL_SHAPES).toContain('schema:Event')
  })

  it('covers schema:Offer', () => {
    expect(SCHEMAORG_SHACL_SHAPES).toContain('schema:Offer')
  })

  it('covers schema:LocalBusiness', () => {
    expect(SCHEMAORG_SHACL_SHAPES).toContain('schema:LocalBusiness')
  })
})
