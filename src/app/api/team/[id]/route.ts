import { NextRequest, NextResponse } from "next/server";
import { getTeamMemberById, saveTeamMember, deleteTeamMember } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    const member = await getTeamMemberById(params.id);
    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }
    const data = session ? member : (({ regNo, ...rest }) => rest)(member);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

import { revalidatePath } from "next/cache";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await saveTeamMember({
      ...body,
      _id: params.id,
    });

    try {
      revalidatePath("/team");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ok = await deleteTeamMember(params.id);
    if (!ok) {
      return NextResponse.json({ success: false, error: "Member not found or deletion failed" }, { status: 404 });
    }

    try {
      revalidatePath("/team");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, message: "Member deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to delete member" }, { status: 500 });
  }
}
