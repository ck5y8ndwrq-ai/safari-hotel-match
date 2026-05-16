export interface MatchRequest {
  regionIds: number[];
  checkIn: string;
  checkOut: string;
  budgetMin: number;
  budgetMax: number;
  accommodationTypes?: string[];
  starMin?: number;
  ratingMin?: number;
  tripPurpose?: string;
  groupType?: string;
  requiredAmenities?: string[];
  targetSpecies?: string[];
  needChineseService?: boolean;
  customerId?: number;
  isMultiStop?: boolean;
}

export interface MatchScore {
  price: number;
  location: number;
  typeMatch: number;
  rating: number;
  purpose: number;
  amenities: number;
  experience: number;
}

export interface MatchResultItem {
  hotelId: number;
  hotelName: string;
  regionName: string;
  accommodationType: string;
  starRating: number | null;
  guestRating: number | null;
  score: number;
  matchRate: number;
  price: number;
  boardBasis: string;
  roomTypeName: string;
  details: MatchScore;
  preferenceBonus: number;
  breakpoints: string[];
}

export interface MatchResponse {
  results: MatchResultItem[];
  total: number;
  filters: Record<string, unknown>;
}
