import { NextRequest, NextResponse } from "next/server";
import { guideStorage } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const guide = guideStorage.getGuideByIdOrSlug(id);

    if (!guide) {
      return NextResponse.json(
        { success: false, error: `Guide with ID or slug '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: guide });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch guide" },
      { status: 500 }
    );
  }
}
