import * as N3 from 'n3'
import SHACLValidator from 'rdf-validate-shacl'
import type { ValidationResult } from '../../store/validationStore'

export interface ShaclReport {
  conforms: boolean
  results: ValidationResult[]
  violatingNodes: string[]
}

function severityFromIri(iri: string): 'error' | 'warning' | 'info' {
  if (iri.includes('Violation')) return 'error'
  if (iri.includes('Warning')) return 'warning'
  return 'info'
}

/**
 * Heuristic: find the 1-based line number in turtleText where the given IRI appears.
 * Checks both the full IRI (inside angle brackets) and the local name after the last # or /.
 */
function findLineForNode(turtleText: string, iri: string): number | undefined {
  const localPart = iri.split(/[/#]/).pop() ?? ''
  const lines = turtleText.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.includes(iri) || (localPart && line.includes(localPart))) {
      return i + 1
    }
  }
  return undefined
}

/**
 * Parse Turtle text into an N3.Store. Throws on parse error.
 */
function parseTurtleToStore(text: string): Promise<N3.Store> {
  return new Promise((resolve, reject) => {
    const store = new N3.Store()
    const parser = new N3.Parser({ format: 'Turtle' })
    parser.parse(text, (error, quad) => {
      if (error) {
        reject(new Error(`Invalid SHACL shapes: ${error.message}`))
        return
      }
      if (quad) {
        store.add(quad)
      } else {
        resolve(store)
      }
    })
  })
}

/**
 * Validate an RDF graph against SHACL shapes.
 *
 * @param dataStore - The N3.Store containing the RDF data to validate.
 * @param shapesText - Turtle-formatted SHACL shapes.
 * @param turtleText - The raw Turtle source (used for line-number lookup).
 * @returns A report containing conformance status, violation details, and a list of violating node IRIs.
 */
export async function validateShacl(
  dataStore: N3.Store,
  shapesText: string,
  turtleText: string
): Promise<ShaclReport> {
  const shapesStore = await parseTurtleToStore(shapesText)

  const validator = new SHACLValidator(shapesStore)
  const report = await validator.validate(dataStore)

  const results: ValidationResult[] = report.results.map((r) => {
    const focusNode = r.focusNode?.value
    const path = r.path?.value ?? ''
    const messages = r.message
    const message = messages.length > 0 ? messages[0].value : 'SHACL constraint violation'
    const severityIri = r.severity?.value ?? ''
    const severity = severityFromIri(severityIri)
    const line = focusNode ? findLineForNode(turtleText, focusNode) : undefined

    return {
      path,
      message,
      severity,
      focusNode,
      line,
    }
  })

  const violatingNodes = [
    ...new Set(results.filter((r) => r.focusNode).map((r) => r.focusNode as string)),
  ]

  return { conforms: report.conforms, results, violatingNodes }
}
