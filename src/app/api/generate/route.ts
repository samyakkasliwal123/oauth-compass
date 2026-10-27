import { NextRequest, NextResponse } from "next/server";
import { POST as researchHandler } from "../research/route";

export async function POST(request: NextRequest) {
  return researchHandler(request);
}
