export function scorePrice(
  price: number,
  budgetMin: number,
  budgetMax: number
): number {
  const preferred = (budgetMin + budgetMax) / 2;

  if (price > budgetMax) {
    const excessRatio = (price - budgetMax) / budgetMax;
    return Math.max(0, 250 * (1 - excessRatio * 5));
  }

  if (price < budgetMin) {
    const savingRatio = (budgetMin - price) / budgetMin;
    return Math.max(125, 250 * (1 - savingRatio * 0.5));
  }

  const deviation = Math.abs(price - preferred) / (budgetMax - budgetMin);
  return 250 * (1 - deviation);
}

export function scoreLocation(
  distanceToParkGate: number | null,
  transferProvided: boolean,
  distanceToAirstrip: number | null,
  airstrip: string | null,
  needTransfer: boolean
): number {
  let score = 0;

  // Distance to park gate (max 100)
  if (distanceToParkGate !== null) {
    if (distanceToParkGate < 1) score += 100;
    else if (distanceToParkGate <= 5) score += 80;
    else if (distanceToParkGate <= 15) score += 50;
    else if (distanceToParkGate <= 30) score += 20;
    else score += 0;
  } else {
    score += 50; // Default for city hotels
  }

  // Transfer service (max 50)
  if (needTransfer && transferProvided) score += 50;
  else if (!needTransfer) score += 30;

  // Airstrip proximity (max 50)
  if (airstrip && distanceToAirstrip !== null) {
    if (distanceToAirstrip < 5) score += 50;
    else if (distanceToAirstrip <= 15) score += 30;
    else score += 10;
  } else if (airstrip) {
    score += 10;
  }

  return Math.min(200, score);
}

export function scoreTypeMatch(
  hotelType: string,
  preferredTypes: string[] | undefined
): number {
  if (!preferredTypes || preferredTypes.length === 0) return 75;

  const compatibility: Record<string, Record<string, number>> = {
    tented_camp: { tented_camp: 150, safari_lodge: 80, eco_lodge: 100, beach_resort: 0, city_hotel: 0 },
    safari_lodge: { tented_camp: 80, safari_lodge: 150, eco_lodge: 100, beach_resort: 30, city_hotel: 20 },
    eco_lodge: { tented_camp: 100, safari_lodge: 100, eco_lodge: 150, beach_resort: 50, city_hotel: 30 },
    beach_resort: { tented_camp: 0, safari_lodge: 30, eco_lodge: 50, beach_resort: 150, city_hotel: 20 },
    city_hotel: { tented_camp: 0, safari_lodge: 20, eco_lodge: 30, beach_resort: 20, city_hotel: 150 },
  };

  let maxScore = 0;
  for (const pref of preferredTypes) {
    const s = compatibility[pref]?.[hotelType] ?? 0;
    if (s > maxScore) maxScore = s;
  }
  return maxScore;
}

export function scoreRating(
  starRating: number | null,
  guestRating: number | null,
  starMin: number | undefined
): number {
  const starScore = starRating !== null
    ? Math.max(0, 100 - Math.abs((starMin || 3) - starRating) * 20)
    : 50;

  const ratingScore = guestRating !== null
    ? (Number(guestRating) / 5) * 100
    : 50;

  return starScore * 0.6 + ratingScore * 0.4;
}

export function scorePurpose(
  tripPurpose: string | undefined,
  groupType: string | undefined,
  hotelTags: { tagCode: string; weight: number }[]
): number {
  if (!tripPurpose) return 75;

  const purposeTagMap: Record<string, string[]> = {
    business: ["business", "luxury"],
    family: ["family", "eco_friendly"],
    couple: ["couple", "luxury"],
    friends: ["friends", "eco_friendly"],
    solo: ["solo", "eco_friendly"],
    incentive: ["business", "luxury", "friends"],
  };

  const relevantTags = purposeTagMap[tripPurpose] ?? [];
  const matched = hotelTags.filter((t) => relevantTags.includes(t.tagCode));
  const totalNeeded = relevantTags.length;
  const score = totalNeeded > 0 ? (matched.length / totalNeeded) * 150 : 75;

  // Group type bonus (max +30)
  let bonus = 0;
  if (groupType === "with_children" && hotelTags.some((t) => t.tagCode === "family")) bonus += 20;
  if (groupType === "with_elderly" && hotelTags.some((t) => t.tagCode === "eco_friendly")) bonus += 15;
  if (groupType === "adults_only") bonus += 10;

  return Math.min(180, Math.round(score + bonus));
}

export function scoreAmenities(
  required: string[] | undefined,
  hotelAmenities: string[]
): number {
  if (!required || required.length === 0) return 75;

  const matched = required.filter((r) => hotelAmenities.includes(r));
  return Math.round((matched.length / required.length) * 100);
}

export function scoreExperience(
  targetSpecies: string[] | undefined,
  hotelSpecies: { species: string }[]
): number {
  if (!targetSpecies || targetSpecies.length === 0) return 25;

  const hotelSpeciesSet = new Set(hotelSpecies.map((s) => s.species));
  const matched = targetSpecies.filter((s) => hotelSpeciesSet.has(s));

  return Math.min(50, Math.round((matched.length / Math.max(targetSpecies.length, 1)) * 50));
}
