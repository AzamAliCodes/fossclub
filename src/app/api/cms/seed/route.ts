import { NextRequest, NextResponse } from "next/server";
import { resetDatabaseToInitial } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await resetDatabaseToInitial();
    return NextResponse.json({
      success: true,
      message: "Database successfully reset to initial seed data",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to reset database" },
      { status: 500 }
    );
  }
}
