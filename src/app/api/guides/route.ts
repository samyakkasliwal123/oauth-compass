import { NextResponse } from "next/server";
import { guideStorage } from "@/lib/storage";

export async function GET() {
  try {
    const guides = guideStorage.getAllGuides();
    return NextResponse.json({ success: true, count: guides.length, data: guides });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch guides" },
      { status: 500 }
    );
  }
}
