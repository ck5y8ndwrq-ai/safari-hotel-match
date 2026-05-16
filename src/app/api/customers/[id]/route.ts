import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
      include: {
        preferences: true,
        bookings: {
          include: { items: { include: { hotel: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
    if (!customer) return NextResponse.json({ error: "客户不存在" }, { status: 404 });
    return NextResponse.json({ customer });
  } catch (error) {
    console.error("GET /api/customers/[id] error:", error);
    return NextResponse.json({ error: "获取客户详情失败" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const customer = await prisma.customer.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        contactPerson: body.contactPerson ?? null,
        contactPhone: body.contactPhone ?? null,
        level: body.level,
      },
    });
    return NextResponse.json({ customer });
  } catch (error) {
    console.error("PUT /api/customers/[id] error:", error);
    return NextResponse.json({ error: "更新客户失败" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.customer.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/customers/[id] error:", error);
    return NextResponse.json({ error: "删除客户失败" }, { status: 500 });
  }
}
