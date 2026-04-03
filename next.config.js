/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core"],
  outputFileTracingIncludes: {
    "/api/audit/generate": ["node_modules/@sparticuz/chromium/bin/**"],
    "/api/audit/generate/route": ["node_modules/@sparticuz/chromium/bin/**"],
  },
};

module.exports = nextConfig;