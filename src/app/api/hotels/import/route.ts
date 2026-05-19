import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "sk-f99c3a7d7b994ac1b743fc3b737add81";

interface ParsedHotel {
  regionNameZh: string;
  nameZh: string;
  nameEn: string;
  accommodationType: string;
  starRating?: number;
  guestRating?: number;
  latitude?: number;
  longitude?: number;
  distanceToParkGate?: number;
  nearestAirstrip?: string;
  distanceToAirstrip?: number;
  transferProvided?: boolean;
  hasChineseService?: boolean;
  descriptionZh?: string;
  totalRooms?: number;
  roomTypes?: {
    nameZh: string;
    nameEn?: string;
    roomCategory: string;
    maxGuests?: number;
    bedType?: string;
    seasonalPrices?: {
      seasonName: string;
      dateStart: string;
      dateEnd: string;
      priceRoomOnly?: number;
      priceHalfBoard?: number;
      priceFullBoard?: number;
      currency?: string;
    }[];
  }[];
  amenities?: string[];
  tags?: { tagCode: string; weight?: number }[];
  targetSpecies?: { species: string; bestSeasonStart?: number; bestSeasonEnd?: number }[];
}

async function analyzeWithDeepSeek(text: string): Promise<ParsedHotel[]> {
  const isEnglish = !/[一-鿿]/.test(text.slice(0, 500));
  const langInstruction = isEnglish
    ? "文档语言为英文。请提取酒店数据，nameZh填英文名（保持原文），nameEn也填英文名。regionNameZh填英文区域名。"
    : "文档语言为中文。请提取酒店数据。";

  const prompt = `${langInstruction}

提取以下酒店文档中的所有酒店信息，以严格的JSON数组格式返回。

返回格式：
[
  {
    "regionNameZh": "区域名称",
    "nameZh": "酒店中文名（或英文名）",
    "nameEn": "酒店英文名",
    "accommodationType": "住宿类型: lodge|tented_camp|hotel|resort|villa",
    "starRating": 星级(1-5),
    "guestRating": 评分(0-5),
    "latitude": 纬度,
    "longitude": 经度,
    "distanceToParkGate": 距离公园大门公里数,
    "nearestAirstrip": "最近的机场/跑道名",
    "distanceToAirstrip": 距离机场公里数,
    "transferProvided": true/false,
    "hasChineseService": true/false,
    "descriptionZh": "酒店中文描述",
    "totalRooms": 房间总数,
    "roomTypes": [
      {
        "nameZh": "房型中文名",
        "nameEn": "房型英文名",
        "roomCategory": "standard|deluxe|suite|villa",
        "maxGuests": 最多入住人数,
        "bedType": "single|double|twin|king",
        "seasonalPrices": [
          {
            "seasonName": "季节名称（如：旺季）",
            "dateStart": "YYYY-MM-DD",
            "dateEnd": "YYYY-MM-DD",
            "priceRoomOnly": 每晚仅客房价格(USD),
            "priceHalfBoard": 每晚半食宿价格(USD),
            "priceFullBoard": 每晚全食宿价格(USD),
            "currency": "USD"
          }
        ]
      }
    ],
    "amenities": ["设施代码列表: wifi,pool,restaurant,bar,game_drive,hot_balloon,bush_dinner,spa,transfer,laundry,nature_walk"],
    "tags": [
      {"tagCode": "luxury|budget|family|romantic|eco|safari|beach|culture|adventure|business", "weight": 1-5}
    ],
    "targetSpecies": [
      {"species": "lion|elephant|leopard|cheetah|rhino|buffalo|giraffe|zebra|wildebeest|hippo|bird", "bestSeasonStart": 1, "bestSeasonEnd": 12}
    ]
  }
]

注意：
1. 只返回JSON数组，不要包含任何其他文字说明
2. 如果文档中有多个酒店，全部提取出来
3. 不确定的字段请用null或省略
4. 所有价格默认为USD
5. 区域名称请使用标准名称

文档内容：
${text.slice(0, 30000)}`;

  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages: [
        { role: "system", content: "你是一个酒店数据提取助手，只输出JSON格式数据。" },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 8192,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API error: ${res.status} ${err}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek returned empty response");

  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const cleanJson = jsonMatch ? jsonMatch[1] : content;
  return JSON.parse(cleanJson.trim());
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Handle confirm action (JSON body)
    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (body.action === "confirm") {
        return handleConfirm(body.hotels);
      }
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Handle text analysis (extracted text from client side)
    const text = await request.text();
    if (!text.trim()) {
      return NextResponse.json({ error: "文本内容为空" }, { status: 400 });
    }

    const hotels = await analyzeWithDeepSeek(text);
    return NextResponse.json({ hotels, rawTextLength: text.length });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "导入失败" },
      { status: 500 }
    );
  }
}

async function handleConfirm(hotels: ParsedHotel[]) {
  const results: { nameZh: string; success: boolean; error?: string }[] = [];

  for (const hotel of hotels) {
    try {
      // Validate required fields
      if (!hotel.nameZh && !hotel.nameEn) {
        results.push({ nameZh: "", success: false, error: "酒店名称不能为空" });
        continue;
      }
      const displayName = hotel.nameZh || hotel.nameEn || "";

      if (!hotel.accommodationType) {
        results.push({ nameZh: displayName, success: false, error: "缺少住宿类型" });
        continue;
      }

      // Find region by nameZh or nameEn
      if (!hotel.regionNameZh) {
        results.push({ nameZh: displayName, success: false, error: "缺少区域信息，无法匹配数据库中的区域" });
        continue;
      }
      const region = await prisma.region.findFirst({
        where: {
          OR: [
            { nameZh: { contains: hotel.regionNameZh } },
            { nameEn: { contains: hotel.regionNameZh } },
          ],
        },
      });
      if (!region) {
        results.push({ nameZh: displayName, success: false, error: `未找到区域「${hotel.regionNameZh}」，请先在区域管理中创建该区域` });
        continue;
      }

      const hotelData: Record<string, unknown> = {
        regionId: region.id,
        nameZh: hotel.nameZh,
        nameEn: hotel.nameEn,
        accommodationType: hotel.accommodationType,
        starRating: hotel.starRating ?? null,
        guestRating: hotel.guestRating ?? null,
        latitude: hotel.latitude ?? null,
        longitude: hotel.longitude ?? null,
        distanceToParkGate: hotel.distanceToParkGate ?? null,
        nearestAirstrip: hotel.nearestAirstrip ?? null,
        distanceToAirstrip: hotel.distanceToAirstrip ?? null,
        transferProvided: hotel.transferProvided ?? false,
        hasChineseService: hotel.hasChineseService ?? false,
        descriptionZh: hotel.descriptionZh ?? null,
        totalRooms: hotel.totalRooms ?? null,
        status: "active",
      };

      if (hotel.roomTypes && hotel.roomTypes.length > 0) {
        hotelData.roomTypes = {
          create: hotel.roomTypes.map((rt) => ({
            nameZh: rt.nameZh || "未知房型",
            nameEn: rt.nameEn ?? null,
            roomCategory: rt.roomCategory || "standard",
            maxGuests: rt.maxGuests ?? 2,
            bedType: rt.bedType ?? null,
            seasonalPrices: rt.seasonalPrices && rt.seasonalPrices.length > 0
              ? {
                  create: rt.seasonalPrices
                    .filter((sp) => sp.seasonName && sp.dateStart && sp.dateEnd)
                    .map((sp) => ({
                      seasonName: sp.seasonName,
                      dateStart: new Date(sp.dateStart),
                      dateEnd: new Date(sp.dateEnd),
                      priceRoomOnly: sp.priceRoomOnly ?? null,
                      priceHalfBoard: sp.priceHalfBoard ?? null,
                      priceFullBoard: sp.priceFullBoard ?? null,
                      currency: sp.currency ?? "USD",
                      isAvailable: true,
                    })),
                }
              : undefined,
          })),
        };
      }

      if (hotel.tags && hotel.tags.length > 0) {
        hotelData.hotelTags = {
          create: hotel.tags.map((t) => ({
            tagCode: t.tagCode,
            weight: t.weight ?? 3,
          })),
        };
      }

      if (hotel.targetSpecies && hotel.targetSpecies.length > 0) {
        hotelData.targetSpecies = {
          create: hotel.targetSpecies.map((s) => ({
            species: s.species,
            bestSeasonStart: s.bestSeasonStart ?? null,
            bestSeasonEnd: s.bestSeasonEnd ?? null,
          })),
        };
      }

      const created = await prisma.hotel.create({ data: hotelData as never });

      if (hotel.amenities && hotel.amenities.length > 0) {
        const amenityRecords = await prisma.amenity.findMany({
          where: { code: { in: hotel.amenities } },
        });
        for (const amenity of amenityRecords) {
          await prisma.hotelAmenity.create({
            data: { hotelId: created.id, amenityId: amenity.id, isFree: true },
          }).catch(() => {});
        }
      }

      results.push({ nameZh: hotel.nameZh, success: true });
    } catch (err) {
      results.push({
        nameZh: hotel.nameZh,
        success: false,
        error: err instanceof Error ? err.message : "导入失败",
      });
    }
  }

  return NextResponse.json({ results });
}
