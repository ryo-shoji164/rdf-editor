// Common RDF namespaces
export const NS = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  owl: 'http://www.w3.org/2002/07/owl#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  foaf: 'http://xmlns.com/foaf/0.1/',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  dcterms: 'http://purl.org/dc/terms/',
  schema: 'https://schema.org/',
  samm: 'urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#',
  'samm-c': 'urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#',
  'samm-e': 'urn:samm:org.eclipse.esmf.samm:entity:2.2.0#',
  unit: 'urn:samm:org.eclipse.esmf.samm:unit:2.2.0#',
} as const

export type KnownPrefix = keyof typeof NS

// Reverse map: IRI prefix → short prefix
const reverseMap = new Map<string, string>()
for (const [prefix, iri] of Object.entries(NS)) {
  reverseMap.set(iri, prefix)
}

/**
 * Shorten a full IRI to prefix:local form using known namespaces.
 * Returns the original IRI if no prefix matches.
 */
export function shorten(iri: string, extra?: Record<string, string>): string {
  // Check extra prefixes first
  if (extra) {
    for (const [pfx, ns] of Object.entries(extra)) {
      if (iri.startsWith(ns)) {
        return `${pfx}:${iri.slice(ns.length)}`
      }
    }
  }
  for (const [ns, pfx] of reverseMap.entries()) {
    if (iri.startsWith(ns)) {
      return `${pfx}:${iri.slice(ns.length)}`
    }
  }
  // Try to extract local name after last # or /
  const hash = iri.lastIndexOf('#')
  const slash = iri.lastIndexOf('/')
  const sep = Math.max(hash, slash)
  if (sep >= 0 && sep < iri.length - 1) {
    return iri.slice(sep + 1)
  }
  return iri
}

/**
 * Expand a shortened prefix:local name back to a full IRI.
 * Returns the original string if it doesn't match any known prefix.
 */
export function expand(shortened: string, extra?: Record<string, string>): string {
  if (!shortened.includes(':')) return shortened

  const [pfx, local] = shortened.split(':', 2)

  // Check extra prefixes first
  if (extra && pfx in extra) {
    return extra[pfx] + local
  }

  // Check built-in prefixes
  if (pfx in NS) {
    return NS[pfx as KnownPrefix] + local
  }

  return shortened
}

/**
 * Extract the local name from a full IRI (after the last '#' or '/').
 * Returns the full IRI if no separator is found.
 */
export function localName(iri: string): string {
  const sep = Math.max(iri.lastIndexOf('#'), iri.lastIndexOf('/'))
  return sep >= 0 ? iri.slice(sep + 1) : iri
}

/**
 * Generate @prefix declarations for Turtle output.
 */
export function prefixDeclarations(extra?: Record<string, string>): string {
  const lines: string[] = []
  const merged = { ...NS, ...(extra ?? {}) }
  for (const [pfx, iri] of Object.entries(merged)) {
    lines.push(`@prefix ${pfx}: <${iri}> .`)
  }
  return lines.join('\n')
}
