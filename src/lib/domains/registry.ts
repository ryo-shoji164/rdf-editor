/**
 * Domain Plugin Registry
 *
 * Central registry for managing domain plugins. Plugins are registered
 * at startup and can be queried at runtime.
 */
import type { DomainPlugin } from '../../types/domain'
import { freePlugin } from './freePlugin'
import { sammPlugin } from '../samm/sammPlugin'

// ─── Internal state ───────────────────────────────────────────────

const plugins = new Map<string, DomainPlugin>()
let activeDomainId = 'free'

// ─── Public API ───────────────────────────────────────────────────

/** Register a domain plugin. Overwrites if same id exists. */
export function registerPlugin(plugin: DomainPlugin): void {
    plugins.set(plugin.id, plugin)
}

/** Unregister a domain plugin by id. */
export function unregisterPlugin(id: string): void {
    plugins.delete(id)
}

/** Get a plugin by id. Returns undefined if not found. */
export function getPlugin(id: string): DomainPlugin | undefined {
    return plugins.get(id)
}

/** Get all registered plugins. */
export function getAllPlugins(): DomainPlugin[] {
    return Array.from(plugins.values())
}

/** Get the currently active domain id. */
export function getActiveDomainId(): string {
    return activeDomainId
}

/** Set the active domain. */
export function setActiveDomainId(id: string): void {
    activeDomainId = id
}

/** Get the currently active plugin. */
export function getActivePlugin(): DomainPlugin | undefined {
    return plugins.get(activeDomainId)
}

/** Get all vocabulary items from the active domain. */
export function getActiveVocabulary(): DomainPlugin['vocabularyItems'] {
    return getActivePlugin()?.vocabularyItems ?? []
}

/**
 * Initialize the registry with built-in plugins.
 * Call this at application startup.
 */
export function initializePlugins(): void {
    // Lazy imports to avoid circular dependencies

    registerPlugin(freePlugin)
    registerPlugin(sammPlugin)
    activeDomainId = 'free'
}

/**
 * Reset the registry (for testing).
 */
export function resetRegistry(): void {
    plugins.clear()
    activeDomainId = 'free'
}
