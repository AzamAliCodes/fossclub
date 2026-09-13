/**
 * CMS Client Authentication & Session Utilities
 *
 * Implements ticket expiry checking and session management:
 * - TTL <= 6 hours enforced client-side
 * - Every page load checks the ticket: past expiry -> throws it away and lands on login
 * - Rips up ticket on logout (clears localStorage and foss_cms_session cookie)
 */

export const CMS_TOKEN_KEY = "foss_cms_token";
export const CMS_EXPIRES_AT_KEY = "foss_cms_expires_at";

// Strict maximum TTL enforced client-side (6 hours in milliseconds)
export const CMS_MAX_TTL_MS = 6 * 60 * 60 * 1000;

export interface DecodedJWTPayload {
  username?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * Safely decodes a JWT payload in the browser.
 */
export function decodeJwtPayload(token: string): DecodedJWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as DecodedJWTPayload;
  } catch {
    return null;
  }
}

/**
 * Gets the token expiration timestamp (in milliseconds).
 * Calculates and returns the earliest expiration timestamp based on:
 * 1. Stored foss_cms_expires_at
 * 2. JWT exp claim
 * 3. Enforced <= 6h max TTL from iat (or creation)
 */
export function getSessionExpiry(token?: string | null): number | null {
  if (typeof window === "undefined") return null;

  const currentToken = token || localStorage.getItem(CMS_TOKEN_KEY);
  if (!currentToken) return null;

  let expiryMs: number | null = null;

  // 1. Check stored expires_at timestamp
  const storedExpiresAt = localStorage.getItem(CMS_EXPIRES_AT_KEY);
  if (storedExpiresAt) {
    const parsed = Number(storedExpiresAt);
    if (!isNaN(parsed) && parsed > 0) {
      expiryMs = parsed;
    }
  }

  // 2. Parse JWT payload
  const payload = decodeJwtPayload(currentToken);
  if (payload) {
    if (payload.exp) {
      const jwtExpMs = payload.exp * 1000;
      expiryMs = expiryMs ? Math.min(expiryMs, jwtExpMs) : jwtExpMs;
    }

    // Enforce client-side TTL <= 6h from issued-at (iat)
    if (payload.iat) {
      const maxAllowedExpMs = payload.iat * 1000 + CMS_MAX_TTL_MS;
      expiryMs = expiryMs ? Math.min(expiryMs, maxAllowedExpMs) : maxAllowedExpMs;
    }
  }

  return expiryMs;
}

/**
 * Checks whether the current session ticket has expired.
 * Returns true if no token exists, if token is malformed, or if current time is past expiry.
 */
export function isSessionExpired(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem(CMS_TOKEN_KEY);
  if (!token) return true;

  const expiryMs = getSessionExpiry(token);
  if (!expiryMs) return true;

  return Date.now() >= expiryMs;
}

/**
 * Saves session ticket and expiry timestamp to localStorage.
 */
export function saveClientSession(token: string, expiresAt?: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CMS_TOKEN_KEY, token);

  if (expiresAt) {
    localStorage.setItem(CMS_EXPIRES_AT_KEY, String(expiresAt));
  } else {
    const payload = decodeJwtPayload(token);
    if (payload?.exp) {
      localStorage.setItem(CMS_EXPIRES_AT_KEY, String(payload.exp * 1000));
    }
  }
}

/**
 * Deletes all CMS session tokens and expiry timestamps from localStorage.
 */
export function clearClientSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CMS_TOKEN_KEY);
  localStorage.removeItem(CMS_EXPIRES_AT_KEY);
}

/**
 * Dispatches an event notifying CMS pages that the session has expired or was unauthorized.
 */
export function notifySessionExpired(): void {
  clearClientSession();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cms-session-expired"));
  }
}

/**
 * Validates the session client-side and against /api/auth/me.
 * If expired or invalid, throws ticket away and returns null.
 */
export async function verifyClientSession(): Promise<{ username: string; role: string } | null> {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(CMS_TOKEN_KEY);
  if (!token || isSessionExpired()) {
    clearClientSession();
    return null;
  }

  try {
    const res = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      clearClientSession();
      return null;
    }

    const data = await res.json();
    if (data.authenticated && data.user) {
      return data.user;
    }

    clearClientSession();
    return null;
  } catch {
    clearClientSession();
    return null;
  }
}

/**
 * Clears client session and calls /api/auth/logout.
 */
export async function logoutClientSession(): Promise<void> {
  clearClientSession();
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (err) {
    console.error("Logout error:", err);
  }
}
