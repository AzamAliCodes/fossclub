import { NextRequest, NextResponse } from "next/server";
import { getEventById, saveEvent, deleteEvent } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await getEventById(params.id);
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: event });
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
    const updated = await saveEvent({
      ...body,
      _id: params.id,
    });

    try {
      revalidatePath("/events");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error(`Error in PUT /api/events/${params?.id}:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update event" },
      { status: 500 }
    );
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
    const ok = await deleteEvent(params.id);
    if (!ok) {
      return NextResponse.json({ success: false, error: "Event not found or deletion failed" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Event deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete event" }, { status: 500 });
  }
}
