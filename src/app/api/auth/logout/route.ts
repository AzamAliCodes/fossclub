import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out" });
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return res;
}

export async function GET() {
  return POST();
}
