import { NextRequest, NextResponse } from "next/server";
import { getTeamMemberById, saveTeamMember, deleteTeamMember } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await getTeamMemberById(params.id);
    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

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
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update member" }, { status: 500 });
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
    return NextResponse.json({ success: true, message: "Member deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete member" }, { status: 500 });
  }
}
