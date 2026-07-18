import "server-only";
import crypto from "node:crypto";

// Minimal HS256 JWT sign/verify using Node's built-in crypto. Replaces the
// `jsonwebtoken` package, which fails at runtime when bundled by Turbopack
// (Next.js 16) on serverless platforms like Vercel. node:crypto is a Node
// builtin, so it is always available and never bundled.

function b64urlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function hmac(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

/** Signs an HS256 JWT with the given payload; `expiresInSec` sets `exp`. */
export function signJwt(
  payload: Record<string, unknown>,
  secret: string,
  expiresInSec: number,
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64urlJson({ alg: "HS256", typ: "JWT" });
  const body = b64urlJson({ ...payload, iat: now, exp: now + expiresInSec });
  const data = `${header}.${body}`;
  return `${data}.${hmac(data, secret)}`;
}

/**
 * Verifies an HS256 JWT and returns its payload, or null if the signature is
 * invalid or the token is expired. Always verifies as HS256 (the header's alg
 * is ignored) so `alg: none` forgery is impossible.
 */
export function verifyJwt(token: string, secret: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expected = hmac(`${header}.${body}`, secret);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as Record<string, unknown>;
    const exp = payload.exp;
    if (typeof exp === "number" && Math.floor(Date.now() / 1000) > exp) return null;
    return payload;
  } catch {
    return null;
  }
}
