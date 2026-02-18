import {
  clerkMiddleware,
  createRouteMatcher,
} from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/',
  '/secret(.*)',
  // Add routes that need protection but exclude public routes
]);

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/public/(.*)',
  '/api/public/(.*)',
  '/trpc/public.(.*)',
  '/campaign-v2/(.*)/analytics',  // Campaign V2 analytics (public access)
  '/campaign/(.*)/analytics',      // Campaign analytics (public access)
  '/campaign/(.*)/analytics-old'   // Campaign analytics v1 (public access)
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req) && !(await auth()).userId) {
    // Redirect to sign-up instead of sign-in
    const signUpUrl = new URL('/sign-up', req.url)
    return NextResponse.redirect(signUpUrl)
  }

  // Skip auth check for explicitly public routes
  if (isPublicRoute(req)) return;

  // Protect routes that require authentication
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',

    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}