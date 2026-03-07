import * as N3 from 'n3'

export interface SerializeOptions {
  prefixes?: Record<string, string>
  format?: 'Turtle' | 'N-Triples' | 'N-Quads'
}

/**
 * Serialize an N3.Store to Turtle text.
 */
export function serializeTurtle(
  store: N3.Store,
  prefixes: Record<string, string> = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = []
    const writer = new N3.Writer({
      format: 'Turtle',
      prefixes: { ...prefixes },
    })

    for (const quad of store) {
      writer.addQuad(quad)
    }

    writer.end((error, result) => {
      if (error) reject(error)
      else {
        // Clean up the output: remove empty prefix declarations
        const cleaned = (result as string)
          .split('\n')
          .filter((line: string) => !line.match(/^@prefix\s+\w*:\s+<>\s*\.\s*$/))
          .join('\n')
        resolve(cleaned)
      }
    })
  })
}

/**
 * Serialize an N3.Store to N-Triples.
 */
export function serializeNTriples(store: N3.Store): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new N3.Writer({ format: 'N-Triples' })
    for (const quad of store) {
      writer.addQuad(quad)
    }
    writer.end((error, result) => {
      if (error) reject(error)
      else resolve(result)
    })
  })
}

/**
 * Trigger a file download in the browser.
 */
export function downloadText(content: string, filename: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
