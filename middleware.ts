import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Use optimistic session cookie check instead of full session API call
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/auth", "/privacy", "/shared"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If it's a public route, allow access
  if (isPublicRoute) {
    // Redirect authenticated users away from auth pages to home
    if (pathname === "/auth" && sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // All other routes (including home '/') require authentication
  if (!sessionCookie) {
    // Store the intended destination to redirect back after auth
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};
