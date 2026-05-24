import arcjet, { detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Keep your route matching logic exactly as you had it
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);


// Create Arcjet middleware
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["userId"], // Track based on Clerk userId
  rules: [
    // Protect against common attacks 
    shield({
      mode: "LIVE",
    }),
    // Bot protection
    detectBot({
      mode: "LIVE", 
      // Allow trusted bots
      allow: [
        "CATEGORY:SEARCH_ENGINE", 
        "GO_HTTP", 
      ],
    }),
  ],
});

// 2. Updated Clerk Middleware
const clerk = clerkMiddleware(async (auth, req) => {

    // We MUST await auth() here for Clerk v6.6.0+
  const { userId, redirectToSignIn } = await auth();

   // Arcjet protection
  await aj.protect(req, {
    userId: userId || "anonymous",
  });


  // 3. If user is accessing a protected route without being logged in
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn();
  }
});

export default clerk;

export const config = {
  matcher: [
    // 4. Keeping your optimized matcher to skip static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};