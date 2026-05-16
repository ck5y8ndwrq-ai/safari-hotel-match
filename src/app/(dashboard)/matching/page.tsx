"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { ACCOMMODATION_TYPES } from "@/constants/accommodation-type";
import { TRIP_PURPOSES, GROUP_TYPES } from "@/constants/purposes";
import { SPECIES_LIST } from "@/constants/species";
import { AMENITIES_LIST } from "@/constants/amenities";

export default function MatchingPage() {
  const router = useRouter();
  const [regions, setRegions] = useState<{ id: number; nameZh: string }[]>([]);
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({
    regionIds: [] as number[],
    checkIn: "",
    checkOut: "",
    budgetMin: "",
    budgetMax: "",
    accommodationTypes: [] as string[],
    starMin: "",
    tripPurpose: "",
    groupType: "",
    requiredAmenities: [] as string[],
    targetSpecies: [] as string[],
    needChineseService: false,
    customerId: "",
  });

  useEffect(() => {
    fetch("/api/regions").then((r) => r.json()).then((d) => setRegions(d.regions)).catch(console.error);
    fetch("/api/customers?limit=100").then((r) => r.json()).then((d) => setCustomers(d.customers || [])).catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("data", JSON.stringify(form));
    router.push(`/matching/results?${params}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">智能匹配</h1>
        <p className="text-muted-foreground">输入需求，系统自动匹配合适的酒店</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>基础筛选</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">目的地</label>
              <Select value={form.regionIds[0]?.toString() || ""} onValueChange={(v) => setForm({ ...form, regionIds: v ? [Number(v)] : [] })}>
                <SelectTrigger><SelectValue placeholder="选择目的地" /></SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (<SelectItem key={r.id} value={String(r.id)}>{r.nameZh}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">入住日期</label>
                <Input type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">退房日期</label>
                <Input type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">最低预算 ($/间/夜)</label>
                <Input type="number" min="0" value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">最高预算 ($/间/夜)</label>
                <Input type="number" min="0" value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} required />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>高级偏好</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">住宿类型</label>
              <div className="flex flex-wrap gap-2">
                {ACCOMMODATION_TYPES.map((t) => (
                  <Badge
                    key={t.value}
                    variant={form.accommodationTypes.includes(t.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const next = form.accommodationTypes.includes(t.value)
                        ? form.accommodationTypes.filter((v) => v !== t.value)
                        : [...form.accommodationTypes, t.value];
                      setForm({ ...form, accommodationTypes: next });
                    }}
                  >
                    {t.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">最低星级</label>
                <Select value={form.starMin} onValueChange={(v) => setForm({ ...form, starMin: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="不限" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">★★★ 及以上</SelectItem>
                    <SelectItem value="4">★★★★ 及以上</SelectItem>
                    <SelectItem value="5">★★★★★</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">出行目的</label>
                <Select value={form.tripPurpose} onValueChange={(v) => setForm({ ...form, tripPurpose: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="不限" /></SelectTrigger>
                  <SelectContent>
                    {TRIP_PURPOSES.map((p) => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">同行人群</label>
                <Select value={form.groupType} onValueChange={(v) => setForm({ ...form, groupType: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="不限" /></SelectTrigger>
                  <SelectContent>
                    {GROUP_TYPES.map((g) => (<SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">关联客户</label>
                <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="不关联" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">想看动物</label>
              <div className="flex flex-wrap gap-2">
                {SPECIES_LIST.map((s) => (
                  <Badge
                    key={s.value}
                    variant={form.targetSpecies.includes(s.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const next = form.targetSpecies.includes(s.value)
                        ? form.targetSpecies.filter((v) => v !== s.value)
                        : [...form.targetSpecies, s.value];
                      setForm({ ...form, targetSpecies: next });
                    }}
                  >
                    {s.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">必需设施</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map((a) => (
                  <Badge
                    key={a.code}
                    variant={form.requiredAmenities.includes(a.code) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const next = form.requiredAmenities.includes(a.code)
                        ? form.requiredAmenities.filter((v) => v !== a.code)
                        : [...form.requiredAmenities, a.code];
                      setForm({ ...form, requiredAmenities: next });
                    }}
                  >
                    {a.nameZh}
                  </Badge>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.needChineseService} onChange={(e) => setForm({ ...form, needChineseService: e.target.checked })} />
              仅显示有中文服务的酒店
            </label>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-12 text-lg gap-2">
          <Search className="h-5 w-5" />开始匹配
        </Button>
      </form>
    </div>
  );
}
