"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACCOMMODATION_TYPES } from "@/constants/accommodation-type";

export default function EditHotelPage() {
  const params = useParams();
  const router = useRouter();
  const [regions, setRegions] = useState<{ id: number; nameZh: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    regionId: "",
    nameZh: "",
    nameEn: "",
    accommodationType: "",
    starRating: "",
    guestRating: "",
    contactPhone: "",
    descriptionZh: "",
    transferProvided: false,
    hasChineseService: false,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/regions").then((r) => r.json()),
      fetch(`/api/hotels/${params.id}`).then((r) => r.json()),
    ])
      .then(([regData, hotelData]) => {
        setRegions(regData.regions);
        const h = hotelData.hotel;
        setForm({
          regionId: String(h.regionId),
          nameZh: h.nameZh,
          nameEn: h.nameEn || "",
          accommodationType: h.accommodationType,
          starRating: h.starRating ? String(h.starRating) : "",
          guestRating: h.guestRating ? String(h.guestRating) : "",
          contactPhone: h.contactPhone || "",
          descriptionZh: h.descriptionZh || "",
          transferProvided: h.transferProvided,
          hasChineseService: h.hasChineseService,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameZh || !form.regionId) return alert("请填写必填项");
    setSubmitting(true);
    try {
      await fetch(`/api/hotels/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          regionId: Number(form.regionId),
          starRating: form.starRating ? Number(form.starRating) : null,
          guestRating: form.guestRating ? Number(form.guestRating) : null,
        }),
      });
      router.push(`/hotels/${params.id}`);
    } catch {
      alert("更新失败");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">加载中...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">编辑酒店</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>基本信息</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">中文名 *</label>
                <Input value={form.nameZh} onChange={(e) => setForm({ ...form, nameZh: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">英文名</label>
                <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">区域</label>
                <Select value={form.regionId} onValueChange={(v) => setForm({ ...form, regionId: v ?? "" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {regions.map((r) => (<SelectItem key={r.id} value={String(r.id)}>{r.nameZh}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">住宿类型</label>
                <Select value={form.accommodationType} onValueChange={(v) => setForm({ ...form, accommodationType: v ?? "" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACCOMMODATION_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">星级</label>
                <Select value={form.starRating} onValueChange={(v) => setForm({ ...form, starRating: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="选择" /></SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5].map((n) => (<SelectItem key={n} value={String(n)}>{"★".repeat(n)}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">评分 (0-5)</label>
                <Input type="number" step="0.1" min="0" max="5" value={form.guestRating} onChange={(e) => setForm({ ...form, guestRating: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">描述</label>
              <textarea className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[100px]" value={form.descriptionZh} onChange={(e) => setForm({ ...form, descriptionZh: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">联系电话</label>
              <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>服务配置</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.transferProvided} onChange={(e) => setForm({ ...form, transferProvided: e.target.checked })} />
                提供接送服务
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.hasChineseService} onChange={(e) => setForm({ ...form, hasChineseService: e.target.checked })} />
                提供中文服务
              </label>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>{submitting ? "提交中..." : "保存"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
        </div>
      </form>
    </div>
  );
}
