"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const regionTypeLabels: Record<string, string> = { national_park: "国家公园", reserve: "保护区", beach_island: "海岛", transit_city: "中转城市" };

export default function RegionsPage() {
  const [grouped, setGrouped] = useState<Record<string, { id: number; nameZh: string; type: string }[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/regions")
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, typeof grouped[string]> = {};
        for (const r of d.regions) {
          const key = r.country.nameZh;
          if (!map[key]) map[key] = [];
          map[key].push({ id: r.id, nameZh: r.nameZh, type: r.type });
        }
        setGrouped(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-muted-foreground">加载中...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">区域管理</h1>
      {Object.keys(grouped).length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">暂无区域数据</CardContent></Card>
      ) : (
        Object.entries(grouped).map(([country, regions]) => (
          <Card key={country}>
            <CardHeader><CardTitle>{country}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {regions.map((r) => (
                  <div key={r.id} className="border rounded-md p-3 flex items-center justify-between">
                    <span className="font-medium">{r.nameZh}</span>
                    <Badge variant="secondary">{regionTypeLabels[r.type] || r.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
