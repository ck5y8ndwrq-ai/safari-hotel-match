import { prisma } from "@/lib/prisma";
import { applyBasicFilters } from "./basic-filters";
import {
  scorePrice,
  scoreLocation,
  scoreTypeMatch,
  scoreRating,
  scorePurpose,
  scoreAmenities,
  scoreExperience,
} from "./scorers";
import type { MatchRequest, MatchResultItem } from "@/types/matching";

export async function runMatching(req: MatchRequest): Promise<{
  results: MatchResultItem[];
  total: number;
  filters: Record<string, unknown>;
}> {
  const {
    regionIds,
    budgetMin,
    budgetMax,
    accommodationTypes,
    starMin,
    tripPurpose,
    groupType,
    requiredAmenities,
    targetSpecies,
    needChineseService,
    customerId,
  } = req;

  const hotels = await prisma.hotel.findMany({
    where: { status: "active" },
    include: {
      region: true,
      hotelTags: true,
      hotelAmenities: { include: { amenity: true } },
      targetSpecies: true,
      roomTypes: {
        include: { seasonalPrices: { where: { isAvailable: true } } },
      },
    },
  });

  const results: MatchResultItem[] = [];

  for (const hotel of hotels) {
    const effectivePrice = hotel.roomTypes[0]?.seasonalPrices[0]?.priceRoomOnly
      ? Number(hotel.roomTypes[0].seasonalPrices[0].priceRoomOnly)
      : null;
    if (!effectivePrice) continue;
    if (effectivePrice < budgetMin) continue;
    if (effectivePrice > budgetMax * 1.2) continue;

    if (regionIds.length > 0 && !regionIds.includes(hotel.regionId)) continue;
    if (accommodationTypes && accommodationTypes.length > 0 && !accommodationTypes.includes(hotel.accommodationType)) continue;
    if (starMin && (hotel.starRating === null || hotel.starRating < starMin)) continue;
    if (needChineseService && !hotel.hasChineseService) continue;

    const priceScore = scorePrice(effectivePrice, budgetMin, budgetMax);
    const locationScore = scoreLocation(
      hotel.distanceToParkGate ? Number(hotel.distanceToParkGate) : null,
      hotel.transferProvided,
      hotel.distanceToAirstrip ? Number(hotel.distanceToAirstrip) : null,
      hotel.nearestAirstrip,
      true
    );

    const typeScore = scoreTypeMatch(hotel.accommodationType, accommodationTypes);
    const ratingScore = scoreRating(hotel.starRating, hotel.guestRating ? Number(hotel.guestRating) : null, starMin);
    const purposeScore = scorePurpose(
      tripPurpose,
      groupType,
      hotel.hotelTags.map((t) => ({ tagCode: t.tagCode, weight: t.weight }))
    );

    const amenityCodes = hotel.hotelAmenities.map((ha) => ha.amenity.code);
    const amenityScore = scoreAmenities(requiredAmenities, amenityCodes);

    const experienceScore = scoreExperience(
      targetSpecies,
      hotel.targetSpecies
    );

    // Preference bonus
    let preferenceBonus = 0;
    if (customerId) {
      const prefs = await prisma.customerPreference.findMany({
        where: { customerId },
      });
      for (const pref of prefs) {
        if (pref.prefKey === "has_chinese" && hotel.hasChineseService) preferenceBonus += 10;
        if (pref.prefKey === "need_transfer" && hotel.transferProvided) preferenceBonus += 10;
        if (pref.prefKey === "accommodation_type" && pref.prefValue === hotel.accommodationType) preferenceBonus += 10;
      }
    }

    const totalScore =
      priceScore +
      locationScore +
      typeScore +
      ratingScore +
      purposeScore +
      amenityScore +
      experienceScore +
      preferenceBonus;

    const breakpoints: string[] = [];
    if (priceScore > 200) breakpoints.push("价格合适");
    if (locationScore > 150) breakpoints.push("位置优越");
    if (typeScore > 120) breakpoints.push("住宿类型匹配");
    if (purposeScore > 120) breakpoints.push("出行目的匹配");
    if (hotel.hasChineseService) breakpoints.push("提供中文服务");
    if (hotel.transferProvided) breakpoints.push("提供接送");

    results.push({
      hotelId: hotel.id,
      hotelName: hotel.nameZh,
      regionName: hotel.region.nameZh,
      accommodationType: hotel.accommodationType,
      starRating: hotel.starRating,
      guestRating: hotel.guestRating ? Number(hotel.guestRating) : null,
      score: Math.round(totalScore),
      matchRate: Math.min(100, Math.round((totalScore / 1000) * 100)),
      price: effectivePrice,
      boardBasis: "room_only",
      roomTypeName: hotel.roomTypes[0]?.nameZh ?? "标准间",
      details: {
        price: Math.round(priceScore),
        location: Math.round(locationScore),
        typeMatch: Math.round(typeScore),
        rating: Math.round(ratingScore),
        purpose: Math.round(purposeScore),
        amenities: Math.round(amenityScore),
        experience: Math.round(experienceScore),
      },
      preferenceBonus,
      breakpoints,
    });
  }

  results.sort((a, b) => b.score - a.score);

  return {
    results: results.slice(0, 50),
    total: results.length,
    filters: {
      regionIds,
      budgetMin,
      budgetMax,
      starMin,
      tripPurpose,
    },
  };
}
