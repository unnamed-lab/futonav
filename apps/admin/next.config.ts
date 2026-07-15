import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Image uploads go browser -> Supabase via a signed URL, so no large payloads
     pass through Server Actions and the default body limit is fine. */
};

export default nextConfig;
