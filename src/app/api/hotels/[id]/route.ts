import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const hotel = await prisma.hotel.findUnique({
      where: { id: Number(id) },
      include: {
        region: { include: { country: true } },
        roomTypes: { include: { seasonalPrices: true } },
        hotelAmenities: { include: { amenity: true } },
        hotelTags: true,
        targetSpecies: true,
        images: { orderBy: { sortOrder: "asc" } },
        packages: true,
      },
    });

    if (!hotel) {
      return NextResponse.json({ error: "酒店不存在" }, { status: 404 });
    }

    return NextResponse.json({ hotel });
  } catch (error) {
    console.error("GET /api/hotels/[id] error:", error);
    return NextResponse.json({ error: "获取酒店详情失败" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    const hotel = await prisma.hotel.update({
      where: { id: Number(id) },
      data: {
        regionId: body.regionId,
        nameZh: body.nameZh,
        nameEn: body.nameEn,
        accommodationType: body.accommodationType,
        starRating: body.starRating ?? null,
        guestRating: body.guestRating ?? null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        distanceToParkGate: body.distanceToParkGate ?? null,
        nearestAirstrip: body.nearestAirstrip ?? null,
        distanceToAirstrip: body.distanceToAirstrip ?? null,
        transferProvided: body.transferProvided ?? false,
        hasChineseService: body.hasChineseService ?? false,
        hasChineseMenu: body.hasChineseMenu ?? false,
        hasChineseGuide: body.hasChineseGuide ?? false,
        totalRooms: body.totalRooms ?? null,
        descriptionZh: body.descriptionZh ?? null,
        contactPhone: body.contactPhone ?? null,
      },
    });

    // Update tags: delete existing, create new
    const tagCodes = (typeof body.tags === "string" ? body.tags : "")
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);
    await prisma.hotelTag.deleteMany({ where: { hotelId: hotel.id } });
    if (tagCodes.length > 0) {
      await prisma.hotelTag.createMany({
        data: tagCodes.map((code: string) => ({
          hotelId: hotel.id,
          tagCode: code,
          weight: 3,
        })),
      });
    }

    // Update targetSpecies: delete existing, create new
    const speciesList = (typeof body.targetSpecies === "string" ? body.targetSpecies : "")
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    await prisma.hotelTargetSpecies.deleteMany({ where: { hotelId: hotel.id } });
    if (speciesList.length > 0) {
      await prisma.hotelTargetSpecies.createMany({
        data: speciesList.map((species: string) => ({
          hotelId: hotel.id,
          species,
        })),
      });
    }

    return NextResponse.json({ hotel });
  } catch (error) {
    console.error("PUT /api/hotels/[id] error:", error);
    return NextResponse.json({ error: "更新酒店失败" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.hotel.update({
      where: { id: Number(id) },
      data: { status: "inactive" },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/hotels/[id] error:", error);
    return NextResponse.json({ error: "删除酒店失败" }, { status: 500 });
  }
}
