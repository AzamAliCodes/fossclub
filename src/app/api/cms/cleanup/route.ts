import { NextRequest, NextResponse } from "next/server";
import { cleanupDuplicateIds } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await cleanupDuplicateIds();
    return NextResponse.json({
      success: true,
      message: "Duplicate records removed",
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to clean up database" },
      { status: 500 }
    );
  }
}