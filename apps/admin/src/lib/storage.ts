import "server-only";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const jwtSecret = process.env.JWT_SECRET || "super-secret-jwt-token-with-at-least-32-characters-long";

// Public bucket that holds admin-uploaded POI/building images.
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "futonavapp";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/**
 * Token used to authorize Storage requests (bucket create + object write/delete).
 *  - Prod / Supabase Cloud: the real service_role secret key (SUPABASE_SERVICE_KEY),
 *    which the Storage API + gateway accept and which bypasses Storage RLS.
 *  - Dev / self-hosted: a short-lived self-signed service_role JWT works against a
 *    local instance whose JWT secret we control.
 */
function serviceToken(): string {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (serviceKey) return serviceKey;

  return jwt.sign(
    {
      role: "service_role",
      iss: "supabase",
      exp: Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes
    },
    jwtSecret,
  );
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}`, apikey: token };
}

/** Creates the public image bucket on first use if it doesn't already exist. */
async function ensureBucket(token: string): Promise<void> {
  const check = await fetch(`${supabaseUrl}/storage/v1/bucket/${BUCKET}`, {
    headers: authHeaders(token),
  });
  if (check.ok) return;

  const create = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });

  // 409/400 "already exists" is fine if two requests race.
  if (!create.ok && create.status !== 409 && create.status !== 400) {
    throw new Error(`Could not create storage bucket (${create.status}): ${await create.text()}`);
  }
}

export interface SignedImageUpload {
  /** Absolute URL the browser PUTs the file bytes to (uploads directly to Supabase). */
  uploadUrl: string;
  /** Final public URL to persist as the POI's imageUrl. */
  publicUrl: string;
}

/**
 * Creates a short-lived signed upload URL so the browser can upload the image
 * bytes directly to Supabase Storage, bypassing the server entirely. This
 * avoids serverless request-body limits (e.g. Vercel's ~4.5MB Server Action cap)
 * and never exposes the service key to the client.
 */
export async function createSignedImageUpload(mimeType: string): Promise<SignedImageUpload> {
  const ext = MIME_EXTENSIONS[mimeType];
  if (!ext) {
    throw new Error("Unsupported image type. Use JPEG, PNG, WebP, GIF or AVIF.");
  }

  const token = serviceToken();
  await ensureBucket(token);

  const path = `${randomUUID()}.${ext}`;
  const res = await fetch(`${supabaseUrl}/storage/v1/object/upload/sign/${BUCKET}/${path}`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    throw new Error(`Could not create signed upload URL (${res.status}): ${await res.text()}`);
  }

  // Response: { url: "/object/upload/sign/<bucket>/<path>?token=..." } (relative).
  const data = (await res.json()) as { url?: string };
  if (!data.url) {
    throw new Error("Signed upload URL was not returned by Storage.");
  }

  const relative = data.url.startsWith("/") ? data.url : `/${data.url}`;
  return {
    uploadUrl: `${supabaseUrl}/storage/v1${relative}`,
    publicUrl: `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`,
  };
}

/**
 * Deletes an image from Storage given its public URL. No-ops for URLs that
 * aren't in our bucket (e.g. an externally pasted URL). Best-effort: callers
 * should not let cleanup failures block the primary DB operation.
 */
export async function deletePoiImage(imageUrl: string): Promise<void> {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return;

  const path = imageUrl.slice(idx + marker.length);
  if (!path) return;

  const token = serviceToken();
  const res = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!res.ok && res.status !== 404) {
    console.warn(`Could not delete storage image (${res.status}): ${await res.text()}`);
  }
}
