import DOMPurify from 'dompurify'

/** Elimina HTML/scripts; conserva solo texto plano seguro para guardar en BD. */
export function sanitizeText(value: string): string {
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim()
}
