"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hotel, Search, FileText, Plus } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({ hotels: 0, orders: 0, pendingOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/hotels?limit=1").then((r) => r.json()),
      fetch("/api/orders?limit=1").then((r) => r.json()),
      fetch("/api/orders?status=pending&limit=1").then((r) => r.json()),
    ])
      .then(([hotels, orders, pending]) => {
        setStats({
          hotels: hotels.total || 0,
          orders: orders.total || 0,
          pendingOrders: pending.total || 0,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">工作台</h1>
        <p className="text-muted-foreground">欢迎回来，今天有什么安排？</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">酒店总数</CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : stats.hotels}
            </div>
            <p className="text-xs text-muted-foreground mt-1">资料库中酒店/营地数量</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">本月订单</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : stats.orders}
            </div>
            <p className="text-xs text-muted-foreground mt-1">本月订单总数</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待处理订单</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">
              {loading ? "..." : stats.pendingOrders}
            </div>
            <p className="text-xs text-muted-foreground mt-1">需要确认的订单</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">快捷操作</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Button variant="outline" className="h-24 flex-col gap-2" asChild>
            <Link href="/hotels/new">
              <Plus className="h-6 w-6" />
              <span>新增酒店</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" asChild>
            <Link href="/matching">
              <Search className="h-6 w-6" />
              <span>智能匹配</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" asChild>
            <Link href="/orders">
              <FileText className="h-6 w-6" />
              <span>订单管理</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
