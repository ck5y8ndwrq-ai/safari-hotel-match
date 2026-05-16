"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { ACCOMMODATION_TYPE_MAP } from "@/constants/accommodation-type";

interface BookingItem {
  id: number; seq: number; hotel: { id: number; nameZh: string; accommodationType: string };
  roomType: { nameZh: string } | null; checkIn: string; checkOut: string;
  nights: number; boardBasis: string; unitPrice: string; quantity: number; subtotal: string;
}
interface Booking {
  id: number; orderNo: string; status: string; totalAmount: string; currency: string;
  tripPurpose: string | null; groupType: string | null; totalGuests: number | null;
  checkIn: string | null; checkOut: string | null; remark: string | null; createdAt: string;
  customer: { id: number; name: string; contactPerson: string | null; contactPhone: string | null } | null;
  items: BookingItem[];
}

const statusLabels: Record<string, string> = { pending: "待确认", confirmed: "已确认", checked_in: "已入住", completed: "已完成", cancelled: "已取消" };
const boardLabels: Record<string, string> = { room_only: "仅房间", half_board: "含早晚餐", full_board: "全膳", all_inclusive: "全含" };
const purposeLabels: Record<string, string> = { business: "商务出差", family: "亲子度假", couple: "情侣出游", friends: "朋友结伴", solo: "独自旅行", incentive: "团队奖励" };

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`).then((r) => r.json()).then((d) => setBooking(d.booking)).catch(console.error).finally(() => setLoading(false));
  }, [params.id]);

  const updateStatus = async (status: string) => {
    await fetch(`/api/orders/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const res = await fetch(`/api/orders/${params.id}`); const d = await res.json(); setBooking(d.booking);
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">加载中...</div>;
  if (!booking) return <div className="text-center py-12 text-muted-foreground">订单不存在</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold">订单 {booking.orderNo}</h1>
        <Badge>{statusLabels[booking.status]}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>客户信息</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            {booking.customer ? (
              <><div className="flex justify-between"><span className="text-muted-foreground">名称</span><span>{booking.customer.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">联系人</span><span>{booking.customer.contactPerson || "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">电话</span><span>{booking.customer.contactPhone || "-"}</span></div></>
            ) : <span className="text-muted-foreground">未关联客户</span>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>订单信息</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">总金额</span><span className="font-semibold">{booking.currency} {Number(booking.totalAmount).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">出行目的</span><span>{booking.tripPurpose ? (purposeLabels[booking.tripPurpose] || booking.tripPurpose) : "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">人数</span><span>{booking.totalGuests ?? "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">创建时间</span><span>{new Date(booking.createdAt).toLocaleString("zh-CN")}</span></div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>住宿明细 {booking.items.length > 1 ? `(${booking.items.length}站路线)` : ""}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {booking.items.map((item) => (
            <div key={item.id} className="border rounded-md p-3">
              {booking.items.length > 1 && <Badge className="mb-2">第{item.seq}站</Badge>}
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{item.hotel.nameZh}</div>
                  <div className="text-sm text-muted-foreground">{ACCOMMODATION_TYPE_MAP[item.hotel.accommodationType]}{item.roomType && ` · ${item.roomType.nameZh}`} · {boardLabels[item.boardBasis] || item.boardBasis}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{booking.currency} {Number(item.unitPrice).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{item.nights}晚 × {item.quantity}间</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{new Date(item.checkIn).toLocaleDateString("zh-CN")} → {new Date(item.checkOut).toLocaleDateString("zh-CN")}</div>
            </div>
          ))}
        </CardContent>
      </Card>
      {booking.remark && (
        <Card><CardHeader><CardTitle>备注</CardTitle></CardHeader><CardContent><p className="text-sm whitespace-pre-wrap">{booking.remark}</p></CardContent></Card>
      )}
      <div className="flex gap-3">
        {booking.status === "pending" && (<><Button onClick={() => updateStatus("confirmed")}>确认订单</Button><Button variant="outline" onClick={() => updateStatus("cancelled")}>取消订单</Button></>)}
        {booking.status === "confirmed" && <Button onClick={() => updateStatus("checked_in")}>标记已入住</Button>}
        {booking.status === "checked_in" && <Button onClick={() => updateStatus("completed")}>标记已完成</Button>}
      </div>
    </div>
  );
}
