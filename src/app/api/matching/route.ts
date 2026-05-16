import { NextRequest, NextResponse } from "next/server";
import { runMatching } from "@/lib/matching-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await runMatching(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/matching error:", error);
    return NextResponse.json({ error: "匹配失败" }, { status: 500 });
  }
}
