import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (customerId) where.customerId = Number(customerId);

    const [orders, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          customer: true,
          items: { include: { hotel: true }, orderBy: { seq: "asc" } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, pageSize });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "获取订单列表失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await prisma.booking.count({
      where: { orderNo: { startsWith: `TR${dateStr}` } },
    });
    const orderNo = `TR${dateStr}${String(count + 1).padStart(3, "0")}`;

    const booking = await prisma.booking.create({
      data: {
        orderNo,
        customerId: body.customerId || null,
        operatorId: body.operatorId || null,
        status: "pending",
        totalAmount: body.totalAmount || 0,
        currency: body.currency || "USD",
        tripPurpose: body.tripPurpose || null,
        groupType: body.groupType || null,
        totalGuests: body.totalGuests || null,
        checkIn: body.checkIn ? new Date(body.checkIn) : null,
        checkOut: body.checkOut ? new Date(body.checkOut) : null,
        remark: body.remark || null,
        items: {
          create: (body.items || []).map(
            (item: { hotelId: number; roomTypeId?: number; seq?: number; checkIn: string; checkOut: string; nights: number; boardBasis?: string; unitPrice: number; quantity?: number; subtotal: number }) => ({
              hotelId: item.hotelId,
              roomTypeId: item.roomTypeId || null,
              seq: item.seq || 1,
              checkIn: new Date(item.checkIn),
              checkOut: new Date(item.checkOut),
              nights: item.nights,
              boardBasis: item.boardBasis || "room_only",
              unitPrice: item.unitPrice,
              quantity: item.quantity || 1,
              subtotal: item.subtotal,
            })
          ),
        },
      },
      include: {
        customer: true,
        items: { include: { hotel: true } },
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
  }
}
