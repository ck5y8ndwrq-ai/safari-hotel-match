"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface Order {
  id: number;
  orderNo: string;
  status: string;
  totalAmount: string;
  currency: string;
  customer: { name: string } | null;
  items: { hotel: { nameZh: string } }[];
  checkIn: string | null;
  checkOut: string | null;
  createdAt: string;
}

const statusLabels: Record<string, string> = { pending: "待确认", confirmed: "已确认", checked_in: "已入住", completed: "已完成", cancelled: "已取消" };
const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = { pending: "default", confirmed: "default", checked_in: "secondary", completed: "outline", cancelled: "destructive" };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const pageSize = 15;
  const statusTabs = ["", "pending", "confirmed", "checked_in", "completed", "cancelled"];
  const statusTabLabels = ["全部", "待确认", "已确认", "已入住", "已完成", "已取消"];

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("limit", String(pageSize));
    fetch(`/api/orders?${params}`)
      .then((r) => r.json())
      .then((d) => { setOrders(d.orders); setTotal(d.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">订单管理</h1>
      <div className="flex gap-2 flex-wrap">
        {statusTabs.map((s, i) => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => { setStatusFilter(s); setPage(1); }}>
            {statusTabLabels[i]}
          </Button>
        ))}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单号</TableHead>
              <TableHead>客户</TableHead>
              <TableHead>酒店</TableHead>
              <TableHead>入住日期</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">加载中...</TableCell></TableRow>
            ) : orders.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">暂无订单</TableCell></TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-sm">{o.orderNo}</TableCell>
                  <TableCell>{o.customer?.name || "-"}</TableCell>
                  <TableCell>{o.items.map((i) => i.hotel.nameZh).join(", ")}</TableCell>
                  <TableCell className="text-sm">{o.checkIn ? new Date(o.checkIn).toLocaleDateString("zh-CN") : "-"}</TableCell>
                  <TableCell>{o.currency} {Number(o.totalAmount).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={statusVariants[o.status]}>{statusLabels[o.status]}</Badge></TableCell>
                  <TableCell className="text-right"><Button variant="outline" size="sm" asChild><Link href={`/orders/${o.id}`}>详情</Link></Button></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>共 {total} 条</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</Button>
            <span className="flex items-center px-2">第 {page} / {totalPages} 页</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</Button>
          </div>
        </div>
      )}
    </div>
  );
}
