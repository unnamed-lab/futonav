"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "super-secret-jwt-token-with-at-least-32-characters-long";
const COOKIE_NAME = "futonav_admin_session";

export async function login(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@futonav.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (email === adminEmail && password === adminPassword) {
    const token = jwt.sign({ email, role: "admin" }, jwtSecret, { expiresIn: "1d" });
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    return true;
  }
  return false;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const payload = jwt.verify(token, jwtSecret) as any;
    return payload.role === "admin";
  } catch {
    return false;
  }
}
