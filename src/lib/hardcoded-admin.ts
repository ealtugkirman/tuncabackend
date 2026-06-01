/** TEMP: fixed admin login (no DB). Remove when proper user management is ready. */
export const HARDCODED_ADMIN = {
  id: 'tunca-admin',
  username: 'tuncaadmin',
  password: 'tuncaadmin2025?!',
  email: 'tuncaadmin@tuncalaw.com',
  name: 'Tunca Admin',
  role: 'SUPERADMIN' as const,
}

export function checkHardcodedAdmin(username: string, password: string): boolean {
  return (
    username.trim().toLowerCase() === HARDCODED_ADMIN.username &&
    password === HARDCODED_ADMIN.password
  )
}
