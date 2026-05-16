"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Eye } from "lucide-react";

interface Customer {
  id: number; name: string; contactPerson: string | null;
  contactPhone: string | null; level: string; createdAt: string;
}

const levelLabels: Record<string, string> = { bronze: "青铜", silver: "白银", gold: "黄金", platinum: "铂金" };
const levelVariants: Record<string, "default" | "secondary" | "outline"> = { bronze: "outline", silver: "secondary", gold: "default", platinum: "default" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0); const [page, setPage] = useState(1);
  const [q, setQ] = useState(""); const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const fetchCustomers = () => {
    setLoading(true);
    const params = new URLSearchParams(); if (q) params.set("q", q);
    params.set("page", String(page)); params.set("limit", String(pageSize));
    fetch(`/api/customers?${params}`).then((r) => r.json()).then((d) => { setCustomers(d.customers); setTotal(d.total); }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, [page]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchCustomers(); };
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">客户管理</h1>
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input placeholder="搜索客户名称/联系人..." value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />
        <Button type="submit" variant="secondary">搜索</Button>
      </form>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow><TableHead>名称</TableHead><TableHead>联系人</TableHead><TableHead>电话</TableHead><TableHead>等级</TableHead><TableHead>注册时间</TableHead><TableHead className="text-right">操作</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">加载中...</TableCell></TableRow>
            ) : customers.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">暂无客户数据</TableCell></TableRow>
            ) : customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.contactPerson || "-"}</TableCell>
                <TableCell>{c.contactPhone || "-"}</TableCell>
                <TableCell><Badge variant={levelVariants[c.level]}>{levelLabels[c.level]}</Badge></TableCell>
                <TableCell className="text-sm">{new Date(c.createdAt).toLocaleDateString("zh-CN")}</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm" asChild><Link href={`/customers/${c.id}`}><Eye className="h-4 w-4 mr-1" />查看</Link></Button></TableCell>
              </TableRow>
            ))}
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
