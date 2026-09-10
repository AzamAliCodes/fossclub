import { NextRequest, NextResponse } from "next/server";
import { addRecruitmentSubscriber, getRecruitmentSubscribers } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    const sub = await addRecruitmentSubscriber({
      name: body.name,
      email: body.email,
      regNo: body.regNo,
      domainOfInterest: body.domainOfInterest || "Technical",
    });

    return NextResponse.json({ success: true, data: sub });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to save interest" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await getRecruitmentSubscribers();
    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}
