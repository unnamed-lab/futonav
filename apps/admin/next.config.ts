import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow POI image uploads (default Server Action body limit is 1MB).
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
