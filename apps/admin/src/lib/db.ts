import { getSupabaseClient, createPoiRepository, resetClient } from "@futonav/api-client";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const jwtSecret = process.env.JWT_SECRET || "super-secret-jwt-token-with-at-least-32-characters-long";

// Generate a JWT signed as the superuser postgres role to bypass RLS in PostgREST
function generateAdminJwt(): string {
  return jwt.sign(
    {
      role: "postgres",
      iss: "supabase",
      // Expose a 10 year expiration for persistent sessions
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 * 10,
    },
    jwtSecret
  );
}

export function getAdminPoiRepository() {
  // Always reset client to ensure we use the admin token
  resetClient();
  const token = generateAdminJwt();
  const client = getSupabaseClient(supabaseUrl, token);
  return createPoiRepository(client);
}
