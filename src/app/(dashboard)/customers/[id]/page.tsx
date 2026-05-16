"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

interface Customer {
  id: number; name: string; contactPerson: string | null;
  contactPhone: string | null; level: string; createdAt: string;
  preferences: { prefKey: string; prefValue: string }[];
  bookings: { id: number; orderNo: string; status: string; totalAmount: string; items: { hotel: { nameZh: string } }[]; createdAt: string }[];
}

const levelLabels: Record<string, string> = { bronze: "青铜", silver: "白银", gold: "黄金", platinum: "铂金" };
const statusLabels: Record<string, string> = { pending: "待确认", confirmed: "已确认", checked_in: "已入住", completed: "已完成", cancelled: "已取消" };
const prefLabels: Record<string, string> = { price_min: "最低预算", price_max: "最高预算", star_min: "最低星级", accommodation_type: "偏好类型", has_chinese: "中文服务", need_transfer: "接送服务" };

export default function CustomerDetailPage() {
  const params = useParams(); const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/customers/${params.id}`).then((r) => r.json()).then((d) => setCustomer(d.customer)).catch(console.error).finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="text-center py-12 text-muted-foreground">加载中...</div>;
  if (!customer) return <div className="text-center py-12 text-muted-foreground">客户不存在</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold">{customer.name}</h1>
        <Badge>{levelLabels[customer.level]}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>基本信息</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">联系人</span><span>{customer.contactPerson || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">电话</span><span>{customer.contactPhone || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">注册时间</span><span>{new Date(customer.createdAt).toLocaleDateString("zh-CN")}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>偏好画像</CardTitle></CardHeader>
          <CardContent>
            {customer.preferences.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无偏好数据</p>
            ) : (
              <div className="space-y-1 text-sm">
                {customer.preferences.map((p, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{prefLabels[p.prefKey] || p.prefKey}</span><span>{p.prefValue}</span></div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>最近的订单</CardTitle></CardHeader>
        <CardContent>
          {customer.bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无订单</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>订单号</TableHead><TableHead>酒店</TableHead><TableHead>金额</TableHead><TableHead>状态</TableHead><TableHead className="text-right">操作</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {customer.bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-sm">{b.orderNo}</TableCell>
                    <TableCell>{b.items.map((i) => i.hotel.nameZh).join(", ")}</TableCell>
                    <TableCell>${Number(b.totalAmount).toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline">{statusLabels[b.status]}</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => router.push(`/orders/${b.id}`)}>查看</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
