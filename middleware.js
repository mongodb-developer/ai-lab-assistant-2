import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = 
    path === '/auth/signin' || 
    path === '/auth/signup' || 
    path === '/api/auth/signin' || 
    path === '/api/auth/signup' ||
    path === '/api/auth/callback' ||
    path === '/api/auth/session' ||
    path === '/api/auth/csrf' ||
    path === '/api/auth/providers' ||
    path.startsWith('/_next') ||
    path.startsWith('/static') ||
    path === '/favicon.ico';

  // Check if the path is public
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check if the path is an API route
  const isApiRoute = path.startsWith('/api/');
  
  // For API routes, check for authentication
  if (isApiRoute) {
    try {
      const token = await getToken({ req: request });
      
      // If no token is found and it's not a public API route, return unauthorized
      if (!token) {
        console.log(`Unauthorized API access attempt: ${path}`);
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      // For admin-only API routes, check if the user is an admin
      if (path.startsWith('/api/admin/') && !token.isAdmin) {
        console.log(`Forbidden API access attempt: ${path}`);
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error('Middleware error:', error);
      // Continue to the next middleware or route handler
    }
  }

  // Continue to the next middleware or route handler
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};