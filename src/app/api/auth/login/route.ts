import { NextRequest, NextResponse } from "next/server";
import { createToken, getAdminCredentials, COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const creds = getAdminCredentials();

    if (username === creds.username && password === creds.password) {
      const token = createToken(username);
      const isSecure = process.env.NODE_ENV === "production" && 
        !req.headers.get("host")?.includes("localhost") && 
        !req.headers.get("host")?.includes("127.0.0.1");

      const res = NextResponse.json({
        success: true,
        user: { username, role: "admin" },
        token,
      });

      res.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return res;
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 });
}
