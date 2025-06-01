// middleware.ts (at project root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // const authCookie = request.cookies.get('auth_token'); // or whatever your cookie name is

  // const { pathname } = request.nextUrl;

  // const isUnProtectedRoute = pathname.startsWith('/projects') && pathname.includes('no_login');
  // if (!authCookie && !isUnProtectedRoute) {
  //   return NextResponse.redirect(new URL('/projects?no_login=true', request.url));
  // }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Or be more specific:
    // '/projects/:path*',
    // '/login/:path*',
    // '/signup/:path*'
  ]
};