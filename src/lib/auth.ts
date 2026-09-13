import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { CMSUserSession } from "@/types";

const JWT_SECRET = process.env.CMS_JWT_SECRET || "foss_club_srm_secret_dev_key_change_in_prod";
const COOKIE_NAME = "foss_cms_session";

export function getAdminCredentials() {
  return {
    username: process.env.CMS_ADMIN_USER || "admin",
    password: process.env.CMS_ADMIN_PASSWORD || "fo$$@dm!n",
  };
}

export function createToken(username: string): string {
  return jwt.sign(
    {
      username,
      role: "admin",
    },
    JWT_SECRET,
    { expiresIn: "6h" }
  );
}

export function verifyToken(token: string): CMSUserSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as CMSUserSession;
    return decoded;
  } catch (err) {
    return null;
  }
}

export function getSessionFromCookies(): CMSUserSession | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (err) {
    return null;
  }
}

export function getSessionFromRequest(request: NextRequest): CMSUserSession | null {
  const token = request.cookies.get(COOKIE_NAME)?.value || 
    request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

export { COOKIE_NAME };
