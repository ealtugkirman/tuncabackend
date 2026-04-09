/**
 * Kamu duyuru / ekip sayfasındaki avukat profil linki.
 * Ana site ayrı domaindeyse NEXT_PUBLIC_LAWYER_PROFILE_BASE_URL kullanın (örn. https://www.ornek.com).
 * Profil yolu varsayılan /ekip/[slug]; NEXT_PUBLIC_LAWYER_PROFILE_PATH ile değiştirilebilir.
 */
export function lawyerPublicProfileHref(slug: string): string {
  const rawOrigin = process.env.NEXT_PUBLIC_LAWYER_PROFILE_BASE_URL?.trim() ?? ''
  const origin = rawOrigin.replace(/\/$/, '')
  let pathPrefix = (process.env.NEXT_PUBLIC_LAWYER_PROFILE_PATH || '/ekip').trim().replace(/\/$/, '')
  if (!pathPrefix.startsWith('/')) pathPrefix = `/${pathPrefix}`
  const path = `${pathPrefix}/${slug}`
  return origin ? `${origin}${path}` : path
}
