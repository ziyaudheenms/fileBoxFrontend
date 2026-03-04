import { clerkMiddleware , createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',             // Your homepage
  '/sign-in(.*)',   // Matches /sign-in and any nested paths like /sign-in/sso
  '/sign-up(.*)',   // Also include sign-up if you have one
]);

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)' , '/images(.*)' , '/sharable(.*)']); // Protect all routes under /dashboard and /images

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};


