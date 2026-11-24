import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/stripe/webhook": ["./assets/email/Ghid-HiLex.pdf"],
    "/api/admin/test-email": ["./assets/email/Ghid-HiLex.pdf"]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb"
    }
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  }
};

export default nextConfig;
