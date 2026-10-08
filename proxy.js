import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

// Paths that are publicly accessible (no auth required)
const publicPaths = ['/', '/login', '/register', '/jobs', '/about', '/services'];

export async function proxy(request) {
  const path = request.nextUrl.pathname;

  // API routes handle their own auth internally
  if (path.startsWith('/api')) {
    return NextResponse.next();
  }

  // Allow public paths (including sub-paths like /jobs/[id])
  const isPublic = publicPaths.some(p => path === p || path.startsWith(p + '/'));
  
  if (isPublic && !path.startsWith('/dashboard')) {
    // If logged-in user hits /login or /register, redirect them to their dashboard
    const sessionCookie = request.cookies.get('session')?.value;
    if (sessionCookie && (path === '/login' || path === '/register')) {
      const session = await decrypt(sessionCookie);
      if (session) {
        return NextResponse.redirect(new URL(`/dashboard/${session.role}`, request.url));
      }
    }
    return NextResponse.next();
  }

  // All other paths require authentication
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const session = await decrypt(sessionCookie);

  if (!session) {
    // Cookie exists but is invalid/expired
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }

  // Role-based access control for dashboard routes
  if (path.startsWith('/dashboard')) {
    // Redirect /dashboard to role-specific dashboard
    if (path === '/dashboard') {
      return NextResponse.redirect(new URL(`/dashboard/${session.role}`, request.url));
    }
    // Block wrong-role access
    if (path.startsWith('/dashboard/recruiter') && session.role !== 'recruiter') {
      return NextResponse.redirect(new URL(`/dashboard/${session.role}`, request.url));
    }
    if (path.startsWith('/dashboard/candidate') && session.role !== 'candidate') {
      return NextResponse.redirect(new URL(`/dashboard/${session.role}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images/|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
