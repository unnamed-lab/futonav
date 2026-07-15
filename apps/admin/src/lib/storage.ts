import "server-only";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const jwtSecret = process.env.JWT_SECRET || "super-secret-jwt-token-with-at-least-32-characters-long";

// Public bucket that holds admin-uploaded POI/building images.
const BUCKET = "poi-images";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/**
 * Mints a short-lived service_role JWT so Storage requests bypass RLS. This
 * mirrors how lib/auth.ts / lib/db.ts sign their own tokens against the shared
 * Supabase JWT secret.
 */
function serviceToken(): string {
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

/**
 * Uploads an image file to Supabase Storage and returns its public URL,
 * suitable for saving straight into a POI's imageUrl.
 */
export async function uploadPoiImage(file: File): Promise<string> {
  const token = serviceToken();
  await ensureBucket(token);

  const ext = MIME_EXTENSIONS[file.type] || "bin";
  const path = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const res = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
      "cache-control": "3600",
    },
    body: bytes,
  });

  if (!res.ok) {
    throw new Error(`Image upload failed (${res.status}): ${await res.text()}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
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
