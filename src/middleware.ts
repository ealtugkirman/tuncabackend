import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // This function runs after the authorized callback
    // The authorized callback handles the main logic
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
        const isLoginRoute = req.nextUrl.pathname === '/login'
        
        // Allow access to login page without token
        if (isLoginRoute) return true
        
        // For admin routes, require token with proper role
        if (isAdminRoute) {
          return !!token && !!token.role && (token.role === 'ADMIN' || token.role === 'SUPERADMIN')
        }
        
        // Allow all other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
  ]
}
