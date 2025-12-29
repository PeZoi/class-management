import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,
});

export default function middleware(request: NextRequest) {
  // Add pathname to request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  // Create new request with modified headers
  const modifiedRequest = new NextRequest(request, {
    headers: requestHeaders,
  });

  // Run the intl middleware with modified request
  return intlMiddleware(modifiedRequest);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(vi|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};

