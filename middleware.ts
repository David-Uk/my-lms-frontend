import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/superadmin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith('/_next') || pathname.startsWith('/superadmin'))) {
    return NextResponse.next();
  }

  // Get token from Authorization header or cookies
  const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
  const cookieToken = request.cookies.get('token')?.value;
  const token = headerToken || cookieToken;

  console.log('[Middleware] Header token exists:', !!headerToken);
  console.log('[Middleware] Cookie token exists:', !!cookieToken);
  console.log('[Middleware] All cookies:', request.cookies.getAll().map(c => c.name).join(', '));

  // If no token, redirect to login
  if (!token) {
    console.log('[Middleware] No token found, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode token to get role (basic JWT decode)
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
    const userRole = payload.role;

    // Debug logging (remove in production)
    console.log('[Middleware] Path:', pathname, 'Role:', userRole, 'Payload:', JSON.stringify(payload));

    // If no role in token, treat as invalid
    if (!userRole) {
      console.log('[Middleware] No role found in token, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    // Admin routes - both admins and superadmins allowed
    if (pathname.startsWith('/admin') && userRole !== 'admin' && userRole !== 'superadmin') {
      console.log('[Middleware] Redirecting non-admin from /admin to /tutor/dashboard. Role was:', userRole);
      return NextResponse.redirect(new URL('/tutor/dashboard', request.url));
    }

    if (pathname.startsWith('/tutor') && userRole === 'learner') {
      return NextResponse.redirect(new URL('/learner/dashboard', request.url));
    }

    if (pathname.startsWith('/learner') && (userRole === 'admin' || userRole === 'superadmin')) {
      // Redirect admins to their appropriate dashboard
      const redirectUrl = userRole === 'superadmin' ? '/superadmin/dashboard' : '/admin/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // Superadmin routes - client-side only for now (middleware cookie issues)
    // Role check will be done in the page component

    // Profile page is accessible by all authenticated users
    if (pathname === '/profile') {
      return NextResponse.next();
    }

  } catch {
    // Invalid token, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
