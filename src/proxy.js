import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Match the routes you want to protect
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // In Clerk v7, call .protect() directly on the auth object
    // This will handle the redirect to sign-in automatically
    await auth.protect(); 
  }
});

export const config = {
  matcher: [
    // This matcher skips internal Next.js files and static assets
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};