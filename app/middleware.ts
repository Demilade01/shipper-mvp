import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';

// Protected routes that require authentication
const protectedRoutes = ['/chat', '/api/users', '/api/messages', '/api/chats'];

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Get access token from cookie
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify token
    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      // Token invalid, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Token valid, allow request
    return NextResponse.next();
  }

  // Allow other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

