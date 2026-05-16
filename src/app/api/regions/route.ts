import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const countryId = searchParams.get("countryId");

    const where = countryId ? { countryId: Number(countryId) } : {};

    const regions = await prisma.region.findMany({
      where,
      include: { country: true },
      orderBy: [{ countryId: "asc" }, { nameZh: "asc" }],
    });

    return NextResponse.json({ regions });
  } catch (error) {
    console.error("GET /api/regions error:", error);
    return NextResponse.json({ error: "获取区域列表失败" }, { status: 500 });
  }
}
