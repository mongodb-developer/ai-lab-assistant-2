import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // If the path starts with /admin, check authentication
  if (path.startsWith('/admin')) {
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    // If there is no session or the user is not an admin, redirect to signin
    if (!session || !session.isAdmin) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Configure which paths middleware should run on
export const config = {
  matcher: [
    // Match all paths starting with /admin
    '/admin/:path*'
  ]
};