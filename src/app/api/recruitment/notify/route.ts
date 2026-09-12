import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Recruitment applications are managed directly via external Google Form.",
  });
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    data: [],
    message: "Recruitment applications are managed directly via external Google Form.",
  });
}

