import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        items: { include: { hotel: true, roomType: true }, orderBy: { seq: "asc" } },
      },
    });
    if (!booking) return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    return NextResponse.json({ booking });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json({ error: "获取订单详情失败" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const booking = await prisma.booking.update({
      where: { id: Number(id) },
      data: { status: body.status, remark: body.remark },
    });
    return NextResponse.json({ booking });
  } catch (error) {
    console.error("PUT /api/orders/[id] error:", error);
    return NextResponse.json({ error: "更新订单失败" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.bookingItem.deleteMany({ where: { bookingId: Number(id) } });
    await prisma.booking.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/orders/[id] error:", error);
    return NextResponse.json({ error: "删除订单失败" }, { status: 500 });
  }
}
