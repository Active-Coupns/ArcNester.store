import { NextResponse } from 'next/server';

export function middleware(request) {
  try {
    const { pathname } = request.nextUrl;

    // Bypass admin, static files, and internal next paths completely
    if (
      pathname.startsWith('/admin') || 
      pathname.startsWith('/api/admin') || 
      pathname.startsWith('/_next') || 
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // Simple safety check pass
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Error Bypassed:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
