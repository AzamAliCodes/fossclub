import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let publicUrl = "";

    // Attempt local file write in non-serverless or local development environment
    if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueName = `${Date.now()}_${cleanName}`;
        const filePath = path.join(uploadsDir, uniqueName);

        fs.writeFileSync(filePath, buffer);
        publicUrl = `/uploads/${uniqueName}`;
      } catch (fsErr) {
        console.warn("Local filesystem write failed, using data URI fallback:", fsErr);
      }
    }

    // On Vercel / serverless functions or when disk is read-only, use inline base64 Data URL
    if (!publicUrl) {
      const mime = file.type || "image/png";
      const base64 = buffer.toString("base64");
      publicUrl = `data:${mime};base64,${base64}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
