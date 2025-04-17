// Empty middleware file so Next.js will create a proper manifest without any complexity
// This avoids "Cannot find module middleware-manifest.json" errors

export function middleware() {
  // This middleware does nothing, just exists to ensure Next.js generates proper manifests
  return;
}

// Limit middleware to no paths to ensure it doesn't affect actual routing
export const config = {
  matcher: [],
};
