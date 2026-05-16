/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep a minimal root config. Application-specific Turbopack settings
  // are defined inside `apps/admin-dashboard/next.config.mjs` to avoid
  // workspace-root experimental warnings at the repository root.
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
