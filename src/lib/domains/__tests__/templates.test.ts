import { describe, it, expect } from 'vitest'
import { Parser } from 'n3'
import { initializePlugins, getAllPlugins } from '../registry'

describe('Domain Templates Validation', () => {
  it('ensures all domain templates contain valid Turtle syntax', () => {
    // Initialize registry to load all plugins
    initializePlugins()

    const plugins = getAllPlugins()
    expect(plugins.length).toBeGreaterThan(0)

    for (const plugin of plugins) {
      for (const template of plugin.templates) {
        // Attempt to parse the template content with n3
        const parser = new Parser({ format: 'Turtle' })
        let error: Error | null = null

        try {
          // parse() throws an error if it hits a syntax error
          parser.parse(template.turtleContent)
        } catch (e) {
          error = e as Error
        }

        // We use a custom assertion message to make debugging easier if a template fails
        expect(
          error,
          `Template "${template.id}" in plugin "${plugin.id}" has invalid Turtle syntax. Error: ${error?.message}`
        ).toBeNull()
      }
    }
  })
})
