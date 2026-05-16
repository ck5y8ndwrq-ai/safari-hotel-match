import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get("regionId");
    const accommodationType = searchParams.get("accommodationType");
    const q = searchParams.get("q");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

    const where: Record<string, unknown> = {};

    if (regionId) where.regionId = Number(regionId);
    if (accommodationType) where.accommodationType = accommodationType;
    if (q) {
      where.OR = [
        { nameZh: { contains: q } },
        { nameEn: { contains: q } },
      ];
    }

    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        include: {
          region: true,
          roomTypes: {
            include: { seasonalPrices: { where: { isAvailable: true }, take: 1 } },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.hotel.count({ where }),
    ]);

    return NextResponse.json({ hotels, total, page, pageSize });
  } catch (error) {
    console.error("GET /api/hotels error:", error);
    return NextResponse.json({ error: "获取酒店列表失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const hotel = await prisma.hotel.create({
      data: {
        regionId: body.regionId,
        nameZh: body.nameZh,
        nameEn: body.nameEn || "",
        accommodationType: body.accommodationType,
        starRating: body.starRating || null,
        guestRating: body.guestRating || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        distanceToParkGate: body.distanceToParkGate || null,
        nearestAirstrip: body.nearestAirstrip || null,
        distanceToAirstrip: body.distanceToAirstrip || null,
        transferProvided: body.transferProvided || false,
        hasChineseService: body.hasChineseService || false,
        hasChineseMenu: body.hasChineseMenu || false,
        hasChineseGuide: body.hasChineseGuide || false,
        totalRooms: body.totalRooms || null,
        descriptionZh: body.descriptionZh || null,
        contactPhone: body.contactPhone || null,
        status: "active",
      },
    });

    return NextResponse.json({ hotel }, { status: 201 });
  } catch (error) {
    console.error("POST /api/hotels error:", error);
    return NextResponse.json({ error: "创建酒店失败" }, { status: 500 });
  }
}
