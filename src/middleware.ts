import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (.png, .jpg, .svg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

const INSTITUTION_NAMES: Record<string, string> = {
  jntuh: 'JNTU Hyderabad (R22/R20)',
  vtu: 'Visvesvaraya Technological University (CBCS)',
  anna: 'Anna University (CBCS)',
  mit: 'MIT OpenCourseWare Archive',
  global: 'EduFind Global Consortium',
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // 1. Detect Subdomain from Hostname, Cookie, or Query Param
  let subdomain = 'jntuh'; // Default institution

  // Check query parameter override: ?inst=vtu
  const instQuery = url.searchParams.get('inst');
  if (instQuery) {
    subdomain = instQuery.toLowerCase();
  } else {
    // Check hostname: [subdomain].edufind.ai OR [subdomain].localhost:9002
    const cleanHost = hostname.split(':')[0]; // strip port
    const parts = cleanHost.split('.');

    // e.g. jntuh.edufind.ai -> parts = ['jntuh', 'edufind', 'ai']
    // e.g. jntuh.localhost -> parts = ['jntuh', 'localhost']
    if (parts.length > 2 && !cleanHost.includes('vercel.app')) {
      subdomain = parts[0].toLowerCase();
    } else if (parts.length === 2 && parts[1] === 'localhost') {
      subdomain = parts[0].toLowerCase();
    } else {
      // Fallback to cookie if present
      const cookieSubdomain = req.cookies.get('edufind_subdomain')?.value;
      if (cookieSubdomain) {
        subdomain = cookieSubdomain;
      }
    }
  }

  // Sanitize
  if (!INSTITUTION_NAMES[subdomain]) {
    subdomain = 'jntuh';
  }

  const institutionName = INSTITUTION_NAMES[subdomain] || 'JNTU Hyderabad';

  // 2. Role-Based Access Control (RBAC) Protection for /admin routes
  if (url.pathname.startsWith('/admin')) {
    const userRole = req.cookies.get('edufind_role')?.value;
    const isLegacyAuth = req.cookies.get('edufind_session')?.value === 'true';

    // If not faculty or admin, redirect to login tab for faculty
    if (userRole !== 'faculty' && userRole !== 'admin' && !isLegacyAuth) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('role', 'faculty');
      loginUrl.searchParams.set('redirect', url.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Clone request headers & pass subdomain telemetry
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-subdomain', subdomain);
  requestHeaders.set('x-institution-name', institutionName);
  requestHeaders.set('x-current-path', url.pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set cookie for client hydration if query param was used
  if (instQuery) {
    response.cookies.set('edufind_subdomain', subdomain, { path: '/', maxAge: 60 * 60 * 24 * 30 });
  }

  return response;
}
