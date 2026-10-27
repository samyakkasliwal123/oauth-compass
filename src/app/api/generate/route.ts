import { NextRequest, NextResponse } from "next/server";
import { GenerateGuideInputSchema } from "@/lib/schema";
import { generateOAuthGuide } from "@/lib/research/service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = GenerateGuideInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input parameters",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const guide = await generateOAuthGuide(parseResult.data);

    return NextResponse.json({
      success: true,
      data: guide,
      guideUrl: `/guides/${guide.id}`,
    });
  } catch (error: any) {
    console.error("Guide generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate guide",
      },
      { status: 500 }
    );
  }
}
