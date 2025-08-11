import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publicRoutes: ["/", "/auth(.*)", "/api(.*)"],
});

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - static files (/_next)
     * - API routes
     * - public routes
     */
    "/((?!_next|.*\\..*|auth|api).*)",
  ],
};