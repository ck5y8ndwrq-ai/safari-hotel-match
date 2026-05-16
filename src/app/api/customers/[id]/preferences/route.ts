import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const preferences = await prisma.customerPreference.findMany({
      where: { customerId: Number(id) },
    });
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("GET /api/customers/[id]/preferences error:", error);
    return NextResponse.json({ error: "获取客户偏好失败" }, { status: 500 });
  }
}
