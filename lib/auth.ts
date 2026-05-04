import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const COOKIE_DEV = "intima-session";
const COOKIE_PROD = "__Host-intima-session";
const SESSION_DAYS = 30;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;
const SLIDING_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;
const LAST_SEEN_THROTTLE_MS = 60 * 60 * 1000;
const BCRYPT_COST = 12;

const DUMMY_HASH =
  "$2b$12$abcdefghijklmnopqrstuuFvgHkflZW2iJF2lEa5PxIZvMjDzj4jPi";

const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_EMAIL = 5;
const MAX_ATTEMPTS_PER_IP = 20;

const isProd = () => process.env.NODE_ENV === "production";
const cookieName = () => (isProd() ? COOKIE_PROD : COOKIE_DEV);

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax" as const,
    expires,
    path: "/",
  };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function verifyPasswordTimingSafe(
  plain: string,
  hash: string | null
): Promise<boolean> {
  const ok = await bcrypt.compare(plain, hash ?? DUMMY_HASH);
  return hash !== null && ok;
}

export async function createSession(userId: string): Promise<void> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MS);
  await prisma.session.create({
    data: { userId, tokenHash, expiresAt },
  });
  const jar = await cookies();
  jar.set(cookieName(), token, cookieOptions(expiresAt));
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(cookieName())?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.session.deleteMany({ where: { tokenHash } }).catch(() => {});
  }
  jar.delete(cookieName());
}

export async function destroyAllSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } }).catch(() => {});
  const jar = await cookies();
  jar.delete(cookieName());
}

export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(cookieName())?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    jar.delete(cookieName());
    return null;
  }

  const remaining = session.expiresAt.getTime() - Date.now();
  if (remaining < SLIDING_THRESHOLD_MS) {
    const newExpiry = new Date(Date.now() + SESSION_MS);
    await prisma.session
      .update({
        where: { id: session.id },
        data: { expiresAt: newExpiry, lastSeenAt: new Date() },
      })
      .catch(() => {});
    jar.set(cookieName(), token, cookieOptions(newExpiry));
  } else if (Date.now() - session.lastSeenAt.getTime() > LAST_SEEN_THROTTLE_MS) {
    await prisma.session
      .update({
        where: { id: session.id },
        data: { lastSeenAt: new Date() },
      })
      .catch(() => {});
  }

  if (Math.random() < 0.01) {
    void prisma.session
      .deleteMany({ where: { expiresAt: { lt: new Date() } } })
      .catch(() => {});
  }

  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}

export async function checkLoginRateLimit(
  email: string,
  ip: string
): Promise<{ ok: boolean; retryAfterSec: number }> {
  const since = new Date(Date.now() - RATE_WINDOW_MS);
  const [emailFails, ipFails] = await Promise.all([
    prisma.loginAttempt.count({
      where: { email, success: false, createdAt: { gte: since } },
    }),
    prisma.loginAttempt.count({
      where: { ip, success: false, createdAt: { gte: since } },
    }),
  ]);
  const blocked =
    emailFails >= MAX_ATTEMPTS_PER_EMAIL || ipFails >= MAX_ATTEMPTS_PER_IP;
  return {
    ok: !blocked,
    retryAfterSec: Math.ceil(RATE_WINDOW_MS / 1000),
  };
}

export async function recordLoginAttempt(
  email: string,
  ip: string,
  success: boolean
): Promise<void> {
  await prisma.loginAttempt
    .create({ data: { email, ip, success } })
    .catch(() => {});

  if (Math.random() < 0.05) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    void prisma.loginAttempt
      .deleteMany({ where: { createdAt: { lt: cutoff } } })
      .catch(() => {});
  }
}

export function safeRedirectPath(from: unknown, fallback = "/admin"): string {
  if (typeof from !== "string") return fallback;
  if (!from.startsWith("/")) return fallback;
  if (from.startsWith("//") || from.startsWith("/\\")) return fallback;
  if (from.startsWith("/admin/login")) return fallback;
  return from;
}
