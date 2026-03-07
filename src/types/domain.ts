/**
 * DomainPlugin interface — the extension point for domain-specific
 * knowledge (SAMM, Schema.org, BOT, FHIR, etc.)
 *
 * Each plugin provides:
 * - Identity (id, label)
 * - Namespaces for prefix registration
 * - Templates for quick-start examples
 * - Vocabulary items for editor auto-completion (optional)
 * - Graph style overrides (optional)
 * - SHACL shapes for validation (optional, future)
 */

// ─── Core interfaces ──────────────────────────────────────────────

export interface DomainPlugin {
    /** Unique identifier, e.g. 'samm', 'schemaorg', 'bot', 'fhir' */
    id: string

    /** Human-readable name shown in UI (e.g. "SAMM", "Schema.org") */
    label: string

    /** Namespaces this domain adds to the prefix map */
    namespaces: Record<string, string>

    /** Pre-built templates users can load */
    templates: DomainTemplate[]

    /** Vocabulary items for Monaco auto-completion (optional) */
    vocabularyItems?: VocabularyItem[]

    /** Cytoscape graph style overrides (optional) */
    graphStyles?: CytoscapeStyleRule[]

    /** SHACL shapes in Turtle format for validation (optional, future) */
    shaclShapes?: string
}

// ─── Template ─────────────────────────────────────────────────────

export interface DomainTemplate {
    /** Unique template key within the domain */
    id: string

    /** Display name shown in the template menu */
    label: string

    /** Short description for tooltip or subtitle */
    description: string

    /** Full Turtle content loaded into the editor */
    turtleContent: string
}

// ─── Vocabulary (for code completion) ─────────────────────────────

export type VocabularyItemKind = 'class' | 'property' | 'datatype' | 'individual'

export interface VocabularyItem {
    /** The full IRI of the vocabulary term */
    iri: string

    /** Prefixed form, e.g. "samm:Aspect" */
    prefixedName: string

    /** Short label for completion menu */
    label: string

    /** Kind of term — drives the completion icon */
    kind: VocabularyItemKind

    /** One-line description for completion detail */
    description?: string

    /** Expected position: 'subject' | 'predicate' | 'object' | 'any' */
    position?: 'subject' | 'predicate' | 'object' | 'any'
}

// ─── Graph styling ────────────────────────────────────────────────

export interface CytoscapeStyleRule {
    /** Cytoscape selector string, e.g. "node[nodeType='iri']" */
    selector: string

    /** Cytoscape style properties */
    style: Record<string, string | number>
}
