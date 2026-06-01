/** Maps login field (email or username) to stored user email. */
export function resolveLoginEmail(identifier: string): string {
  const trimmed = identifier.trim().toLowerCase()
  if (trimmed.includes('@')) {
    return trimmed
  }
  return `${trimmed}@tuncalaw.com`
}

export const TUNCA_ADMIN_USERNAME = 'tuncaadmin'
export const TUNCA_ADMIN_EMAIL = `${TUNCA_ADMIN_USERNAME}@tuncalaw.com`
