/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const sessionCookie = request.cookies.get('session')?.value

  // Public paths
  if (path === '/login' || path === '/' || path.startsWith('/api/') || path.startsWith('/_next')) {
    // If logged in and trying to go to login or home, redirect based on role
    if ((path === '/login' || path === '/') && sessionCookie) {
      try {
        const session = await decrypt(sessionCookie)
        if (session.role === 'ADMIN') return NextResponse.redirect(new URL('/dashboard', request.url))
        if (session.role === 'VOLUNTEER') return NextResponse.redirect(new URL('/volunteer', request.url))
      } catch (e) {
        // invalid session, clear it and let them login
        const res = NextResponse.next()
        res.cookies.delete('session')
        return res
      }
    }
    if (path === '/') return NextResponse.redirect(new URL('/login', request.url))
    return NextResponse.next()
  }

  // Not logged in
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const session = await decrypt(sessionCookie)

    // Admin-only routes
    const adminRoutes = ['/dashboard', '/participants', '/hotels', '/volunteers', '/reports']
    const isAdminRoute = adminRoutes.some(route => path.startsWith(route))

    if (isAdminRoute && session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/volunteer', request.url)) // redirect unauthorized
    }

    // Volunteer-only routes
    if (path.startsWith('/volunteer') && session.role !== 'ADMIN' && session.role !== 'VOLUNTEER') {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
