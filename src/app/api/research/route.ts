import { NextRequest, NextResponse } from "next/server";
import { GenerateGuideInputSchema } from "@/lib/schema";
import { generateOAuthGuide, ResearchStageUpdate } from "@/lib/research/service";

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

    const isStream =
      request.headers.get("accept")?.includes("text/event-stream") ||
      request.nextUrl.searchParams.get("stream") === "true";

    if (isStream) {
      const responseStream = new TransformStream();
      const writer = responseStream.writable.getWriter();
      const encoder = new TextEncoder();

      const sendEvent = async (event: ResearchStageUpdate & { error?: string }) => {
        try {
          await writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // Client disconnected
        }
      };

      // Execute in background
      (async () => {
        try {
          const guide = await generateOAuthGuide(parseResult.data, async (update) => {
            await sendEvent(update);
          });

          await sendEvent({
            stage: "completed",
            message: "Guide generation complete",
            progressPercent: 100,
            guideUrl: `/guides/${guide.id}`,
          });
        } catch (err: any) {
          await sendEvent({
            stage: "completed",
            message: err.message || "Failed to generate guide",
            progressPercent: 100,
            error: err.message,
          });
        } finally {
          await writer.close();
        }
      })();

      return new Response(responseStream.readable, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming response for API consumers
    const guide = await generateOAuthGuide(parseResult.data);

    return NextResponse.json({
      success: true,
      data: guide,
      guideUrl: `/guides/${guide.id}`,
    });
  } catch (error: any) {
    console.error("Research API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to research and generate guide",
      },
      { status: 500 }
    );
  }
}
