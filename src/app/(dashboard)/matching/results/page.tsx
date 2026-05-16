"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Star, DollarSign, Users } from "lucide-react";
import { ACCOMMODATION_TYPE_MAP } from "@/constants/accommodation-type";

interface MatchResult {
  hotelId: number;
  hotelName: string;
  regionName: string;
  accommodationType: string;
  starRating: number | null;
  guestRating: number | null;
  score: number;
  matchRate: number;
  price: number;
  roomTypeName: string;
  details: { price: number; location: number; typeMatch: number; rating: number; purpose: number; amenities: number; experience: number };
  preferenceBonus: number;
  breakpoints: string[];
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataStr = searchParams.get("data");
    if (!dataStr) return;
    const criteria = JSON.parse(dataStr);
    fetch("/api/matching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        regionIds: criteria.regionIds,
        checkIn: criteria.checkIn,
        checkOut: criteria.checkOut,
        budgetMin: Number(criteria.budgetMin),
        budgetMax: Number(criteria.budgetMax),
        accommodationTypes: criteria.accommodationTypes,
        starMin: criteria.starMin ? Number(criteria.starMin) : undefined,
        tripPurpose: criteria.tripPurpose || undefined,
        groupType: criteria.groupType || undefined,
        requiredAmenities: criteria.requiredAmenities,
        targetSpecies: criteria.targetSpecies,
        needChineseService: criteria.needChineseService,
        customerId: criteria.customerId ? Number(criteria.customerId) : undefined,
      }),
    })
      .then((r) => r.json())
      .then((d) => setResults(d.results || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleOrder = async (hotelId: number, price: number) => {
    const criteria = JSON.parse(searchParams.get("data") || "{}");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: criteria.customerId ? Number(criteria.customerId) : null,
        totalAmount: price,
        tripPurpose: criteria.tripPurpose || null,
        groupType: criteria.groupType || null,
        checkIn: criteria.checkIn || null,
        checkOut: criteria.checkOut || null,
        items: [{ hotelId, checkIn: criteria.checkIn, checkOut: criteria.checkOut, nights: 1, unitPrice: price, subtotal: price }],
      }),
    });
    const data = await res.json();
    if (data.booking) router.push(`/orders/${data.booking.id}`);
  };

  const getMatchColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-amber-600";
    return "text-gray-500";
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">正在匹配中...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push("/matching")}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold">匹配结果</h1>
        <span className="text-muted-foreground text-sm">共 {results.length} 家</span>
      </div>

      {results.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><p>未找到匹配的酒店</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/matching")}>重新筛选</Button>
        </CardContent></Card>
      ) : (
        results.map((r) => (
          <Card key={r.hotelId} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="text-center min-w-[64px]">
                  <div className={`text-2xl font-bold ${getMatchColor(r.matchRate)}`}>{r.matchRate}%</div>
                  <div className="text-xs text-muted-foreground">匹配度</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{r.hotelName}</h3>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                        <MapPin className="h-3 w-3" />{r.regionName}
                        <Star className="h-3 w-3 ml-2" />{r.starRating ? "★".repeat(r.starRating) : "-"}
                        <span className="ml-2">评分 {r.guestRating ?? "-"}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">${r.price}</div>
                      <div className="text-xs text-muted-foreground">/间/夜</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="secondary">{ACCOMMODATION_TYPE_MAP[r.accommodationType]}</Badge>
                    <Badge variant="secondary">{r.roomTypeName}</Badge>
                    {r.breakpoints.slice(0, 3).map((b, i) => (
                      <Badge key={i} variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">{b}</Badge>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />价格 {r.details.price}/250</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />位置 {r.details.location}/200</span>
                    <span className="flex items-center gap-1"><Star className="h-3 w-3" />类型 {r.details.typeMatch}/150</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />目的 {r.details.purpose}/150</span>
                    {r.preferenceBonus > 0 && <Badge variant="outline" className="text-amber-600">历史偏好 +{r.preferenceBonus}</Badge>}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => router.push(`/hotels/${r.hotelId}`)}>查看详情</Button>
                    <Button size="sm" onClick={() => handleOrder(r.hotelId, r.price)}>下单</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-muted-foreground">加载中...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
