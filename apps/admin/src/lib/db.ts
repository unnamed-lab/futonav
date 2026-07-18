import { getSupabaseClient, createPoiRepository, resetClient } from "@futonav/api-client";
import { signJwt } from "./jwt";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const jwtSecret = process.env.JWT_SECRET || "super-secret-jwt-token-with-at-least-32-characters-long";

// Generate a JWT signed as the superuser postgres role to bypass RLS in PostgREST
function generateAdminJwt(): string {
  const tenYears = 60 * 60 * 24 * 365 * 10;
  return signJwt({ role: "postgres", iss: "supabase" }, jwtSecret, tenYears);
}

/**
 * Token used for privileged (RLS-bypassing) admin writes.
 *  - Prod / Supabase Cloud: the real service_role secret key (SUPABASE_SERVICE_KEY).
 *    Cloud rejects self-signed tokens at the API gateway, so a real key is required.
 *  - Dev / self-hosted: a self-signed postgres JWT works against a local instance
 *    whose JWT secret we control.
 */
export function getAdminToken(): string {
  return process.env.SUPABASE_SERVICE_KEY || generateAdminJwt();
}

export function getAdminPoiRepository() {
  // Always reset client to ensure we use the admin token
  resetClient();
  const client = getSupabaseClient(supabaseUrl, getAdminToken());
  return createPoiRepository(client);
}
