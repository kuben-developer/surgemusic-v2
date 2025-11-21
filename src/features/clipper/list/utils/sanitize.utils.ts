/**
 * Sanitize input video name for use as URL path
 * - Lowercase
 * - Remove file extension
 * - Replace special chars with dashes
 * - Collapse multiple dashes
 * - Trim leading/trailing dashes
 */
export function sanitizeInputVideoName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')  // Remove extension
    .replace(/[^a-z0-9-_]/g, '-')  // Replace special chars with dash
    .replace(/-+/g, '-')  // Collapse multiple dashes
    .replace(/^-|-$/g, '');  // Trim leading/trailing dashes
}
