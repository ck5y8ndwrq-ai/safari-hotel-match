import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const amenities = await prisma.amenity.findMany({
      orderBy: { category: "asc" },
    });
    return NextResponse.json({ amenities });
  } catch (error) {
    console.error("GET /api/amenities error:", error);
    return NextResponse.json({ error: "获取设施列表失败" }, { status: 500 });
  }
}
