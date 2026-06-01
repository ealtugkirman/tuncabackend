/** Maps admin username to stored user email (users are keyed by email in the DB). */
export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@tuncalaw.com`
}

export const TUNCA_ADMIN_USERNAME = 'tuncaadmin'
export const TUNCA_ADMIN_EMAIL = usernameToEmail(TUNCA_ADMIN_USERNAME)
