import { NextRequest, NextResponse } from "next/server";
import { getEvents, saveEvent } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get("active");
    const category = searchParams.get("category");

    let events = await getEvents();

    if (active !== null) {
      const isActive = active === "true";
      events = events.filter((e) => e.active === isActive);
    }

    if (category && category !== "All") {
      events = events.filter((e) => e.category === category);
    }

    return NextResponse.json(
      { success: true, data: events },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    const newEvent = await saveEvent(body);
    return NextResponse.json({ success: true, data: newEvent });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
