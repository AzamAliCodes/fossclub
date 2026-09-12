import { NextRequest, NextResponse } from "next/server";
import { getTeamMembers, saveTeamMember } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");
    const year = searchParams.get("year");

    let members = await getTeamMembers();

    if (domain && domain !== "All") {
      members = members.filter((m) => m.domain === domain);
    }

    if (year && year !== "All") {
      members = members.filter((m) =>
        m.statusHistory.some((h) => h.year === year)
      );
    }

    const session = getSessionFromRequest(req);

    // Privacy Protection: Strip regNo for unauthenticated public visitors
    const data = session
      ? members
      : members.map(({ regNo, ...rest }) => rest);

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    const newMember = await saveTeamMember(body);

    try {
      revalidatePath("/team");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, data: newMember });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create team member" },
      { status: 500 }
    );
  }
}
