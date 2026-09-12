import { NextRequest, NextResponse } from "next/server";
import { getRecruitmentConfig, updateRecruitmentConfig } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getRecruitmentConfig();
    return NextResponse.json(
      { success: true, data: config },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch recruitment config" },
      { status: 500 }
    );
  }
}

import { revalidatePath } from "next/cache";

export async function PUT(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await updateRecruitmentConfig(body);

    try {
      revalidatePath("/recruitments");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update recruitment config" },
      { status: 500 }
    );
  }
}
