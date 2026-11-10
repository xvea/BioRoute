import { NextResponse } from 'next/server';

/**
 * Validates basic JWT structure and expiration
 */
function isValidJWT(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    // Base64URL decode in Edge runtime compatible manner
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);

    // Check expiration timestamp
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Route Guard Middleware
 * - Enforces authentication on protected routes (/(main)/* such as /dashboard)
 * - Redirects authenticated users from /login and / to /dashboard
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const hasValidToken = isValidJWT(token);

  // Protected operational routes
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/verifikasi') ||
    pathname.startsWith('/batch') ||
    pathname.startsWith('/laporan') ||
    pathname.startsWith('/pengaturan');

  // 1. If accessing protected routes without valid token -> redirect to /login
  if (isProtectedRoute && !hasValidToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    // Ensure any invalid/expired cookie is cleaned
    if (token) {
      response.cookies.delete('token');
    }
    return response;
  }

  // 2. Handle Root / Route: Redirect based on authentication state
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(hasValidToken ? '/dashboard' : '/login', request.url)
    );
  }

  // 3. If authenticated user visits /login -> redirect to /dashboard
  if (pathname === '/login' && hasValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - static files (svg, png, jpg, etc.)
     * - api routes (handled independently)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)',
  ],
};
