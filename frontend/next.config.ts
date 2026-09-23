import type { NextConfig } from "next";

// Proxy /api/backend/* to the backend so the browser never hits CORS.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/backend/:path*", destination: `${BACKEND_URL}/:path*` }];
  },
};

export default nextConfig;
