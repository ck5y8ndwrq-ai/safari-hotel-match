import type { MatchRequest } from "@/types/matching";

export interface HotelRow {
  id: number;
  regionId: number;
  accommodationType: string;
  starRating: number | null;
}

export interface SeasonalPriceRow {
  hotelId: number;
  roomTypeId: number;
  priceRoomOnly: number | null;
  priceHalfBoard: number | null;
  priceFullBoard: number | null;
  priceAllInclusive: number | null;
  isAvailable: boolean;
}

export function applyBasicFilters(
  hotels: HotelRow[],
  prices: SeasonalPriceRow[],
  filters: Pick<
    MatchRequest,
    "regionIds" | "checkIn" | "checkOut" | "budgetMin" | "budgetMax" | "accommodationTypes" | "starMin" | "ratingMin"
  >
): { hotel: HotelRow; price: SeasonalPriceRow; boardBasis: string }[] {
  const checkIn = new Date(filters.checkIn);
  const checkOut = new Date(filters.checkOut);

  return hotels
    .map((hotel) => {
      const matchingPrice = prices.find(
        (p) =>
          p.hotelId === hotel.id &&
          p.isAvailable &&
          p.priceRoomOnly !== null
      );
      if (!matchingPrice) return null;

      // Region filter
      if (filters.regionIds.length > 0 && !filters.regionIds.includes(hotel.regionId)) {
        return null;
      }

      // Accommodation type filter
      if (filters.accommodationTypes && filters.accommodationTypes.length > 0) {
        if (!filters.accommodationTypes.includes(hotel.accommodationType)) {
          return null;
        }
      }

      // Star rating filter
      if (filters.starMin && (hotel.starRating === null || hotel.starRating < filters.starMin)) {
        return null;
      }

      return { hotel, price: matchingPrice, boardBasis: "room_only" };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .filter(({ price }) => {
      const priceVal = Number(price.priceRoomOnly);
      return priceVal >= filters.budgetMin && priceVal <= filters.budgetMax * 1.2;
    });
}
