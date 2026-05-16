"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Eye, Trash2 } from "lucide-react";
import { ACCOMMODATION_TYPE_MAP } from "@/constants/accommodation-type";

interface Hotel {
  id: number;
  nameZh: string;
  region: { nameZh: string };
  accommodationType: string;
  starRating: number | null;
  guestRating: string | null;
  status: string;
  roomTypes: { seasonalPrices: { priceRoomOnly: string }[] }[];
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [regionId, setRegionId] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const pageSize = 15;

  const fetchHotels = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (regionId) params.set("regionId", regionId);
    if (typeFilter) params.set("accommodationType", typeFilter);
    params.set("page", String(page));
    params.set("limit", String(pageSize));

    fetch(`/api/hotels?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setHotels(data.hotels);
        setTotal(data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHotels(); }, [page, regionId, typeFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除该酒店？")) return;
    await fetch(`/api/hotels/${id}`, { method: "DELETE" });
    fetchHotels();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHotels();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">酒店管理</h1>
        <Button asChild>
          <Link href="/hotels/new"><Plus className="h-4 w-4 mr-1" />新增酒店</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="搜索酒店名称..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-48"
          />
          <Button type="submit" variant="secondary">搜索</Button>
        </form>
        <Select value={regionId} onValueChange={(v) => setRegionId(v ?? "all")}>
          <SelectTrigger className="w-36"><SelectValue placeholder="全部区域" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部区域</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
          <SelectTrigger className="w-36"><SelectValue placeholder="全部类型" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            {Object.entries(ACCOMMODATION_TYPE_MAP).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>区域</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>星级</TableHead>
              <TableHead>评分</TableHead>
              <TableHead>参考价</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">加载中...</TableCell></TableRow>
            ) : hotels.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">暂无酒店数据</TableCell></TableRow>
            ) : (
              hotels.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">{h.nameZh}</TableCell>
                  <TableCell>{h.region?.nameZh}</TableCell>
                  <TableCell>{ACCOMMODATION_TYPE_MAP[h.accommodationType] || h.accommodationType}</TableCell>
                  <TableCell>{h.starRating ? "★".repeat(h.starRating) : "-"}</TableCell>
                  <TableCell>{h.guestRating ?? "-"}</TableCell>
                  <TableCell>{h.roomTypes[0]?.seasonalPrices[0]?.priceRoomOnly ? `$${Number(h.roomTypes[0].seasonalPrices[0].priceRoomOnly)}` : "-"}</TableCell>
                  <TableCell>
                    <Badge variant={h.status === "active" ? "default" : "secondary"}>{h.status === "active" ? "营业" : "停用"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild><Link href={`/hotels/${h.id}`}><Eye className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="icon" asChild><Link href={`/hotels/${h.id}/edit`}><Pencil className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(h.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
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
