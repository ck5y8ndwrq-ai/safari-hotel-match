"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import { ACCOMMODATION_TYPE_MAP } from "@/constants/accommodation-type";

interface Hotel {
  id: number;
  nameZh: string;
  nameEn: string;
  accommodationType: string;
  starRating: number | null;
  guestRating: string | null;
  contactPhone: string | null;
  descriptionZh: string | null;
  transferProvided: boolean;
  hasChineseService: boolean;
  status: string;
  region: { nameZh: string; country: { nameZh: string } };
  roomTypes: { id: number; nameZh: string; maxGuests: number; seasonalPrices: { seasonName: string; priceRoomOnly: string }[] }[];
  hotelAmenities: { amenity: { nameZh: string } }[];
  hotelTags: { tagCode: string }[];
}

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/hotels/${params.id}`)
      .then((r) => r.json())
      .then((d) => setHotel(d.hotel))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("确定删除这家酒店？")) return;
    await fetch(`/api/hotels/${params.id}`, { method: "DELETE" });
    router.push("/hotels");
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">加载中...</div>;
  if (!hotel) return <div className="text-center py-12 text-muted-foreground">酒店不存在</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold flex-1">{hotel.nameZh}</h1>
        <Button variant="outline" size="sm" asChild>
          <a href={`/hotels/${hotel.id}/edit`}><Pencil className="h-4 w-4 mr-1" />编辑</a>
        </Button>
        <Button variant="outline" size="sm" onClick={handleDelete}><Trash2 className="h-4 w-4 mr-1 text-destructive" />删除</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>基本信息</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">英文名</span><span>{hotel.nameEn || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">所属区域</span><span>{hotel.region?.country?.nameZh} - {hotel.region?.nameZh}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">住宿类型</span><span>{ACCOMMODATION_TYPE_MAP[hotel.accommodationType]}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">星级</span><span>{hotel.starRating ? "★".repeat(hotel.starRating) : "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">评分</span><span>{hotel.guestRating ?? "-"} / 5.0</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">电话</span><span>{hotel.contactPhone || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">状态</span><Badge variant={hotel.status === "active" ? "default" : "secondary"}>{hotel.status === "active" ? "营业中" : "已停用"}</Badge></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>服务</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-muted-foreground">接送:</span>
              <Badge variant={hotel.transferProvided ? "default" : "outline"}>{hotel.transferProvided ? "提供" : "不提供"}</Badge>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">中文服务:</span>
              <Badge variant={hotel.hasChineseService ? "default" : "outline"}>{hotel.hasChineseService ? "提供" : "不提供"}</Badge>
            </div>
            <div className="pt-2">
              <span className="text-muted-foreground">设施:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {hotel.hotelAmenities?.length ? hotel.hotelAmenities.map((a, i) => <Badge key={i} variant="secondary">{a.amenity.nameZh}</Badge>) : <span className="text-muted-foreground">暂无</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {hotel.descriptionZh && (
        <Card>
          <CardHeader><CardTitle>简介</CardTitle></CardHeader>
          <CardContent><p className="text-sm whitespace-pre-wrap">{hotel.descriptionZh}</p></CardContent>
        </Card>
      )}

      {hotel.roomTypes?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>房型与价格</CardTitle></CardHeader>
          <CardContent>
            {hotel.roomTypes.map((rt) => (
              <div key={rt.id} className="border rounded-md p-3 mb-2">
                <div className="font-medium">{rt.nameZh}</div>
                <div className="text-sm text-muted-foreground">最多入住：{rt.maxGuests}人</div>
                {rt.seasonalPrices?.map((sp, i) => (
                  <div key={i} className="text-sm flex gap-4 mt-1">
                    <Badge variant="outline">{sp.seasonName === "high" ? "旺季" : sp.seasonName === "shoulder" ? "平季" : "淡季"}</Badge>
                    <span>${sp.priceRoomOnly}/间/夜</span>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
