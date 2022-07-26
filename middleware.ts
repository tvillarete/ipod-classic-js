// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  console.log({ cookies: request.cookies.entries() });

  // Deleting cookies
  const hi = response.cookies.delete('spotify-token');
  console.log('Removing cookie: spotify-token', hi);

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/auth/logout',
};
