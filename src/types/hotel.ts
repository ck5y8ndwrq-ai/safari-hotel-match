export type AccommodationType =
  | "tented_camp"
  | "safari_lodge"
  | "eco_lodge"
  | "beach_resort"
  | "city_hotel";

export type RegionType =
  | "national_park"
  | "reserve"
  | "beach_island"
  | "transit_city";

export type BoardBasis = "room_only" | "half_board" | "full_board" | "all_inclusive";

export type BookingStatus = "pending" | "confirmed" | "checked_in" | "completed" | "cancelled";

export type TripPurpose = "business" | "family" | "couple" | "friends" | "solo" | "incentive";

export type GroupType = "adults_only" | "with_children" | "with_elderly" | "large_group";

export type SeasonName = "high" | "shoulder" | "low";

export type Species =
  | "wildebeest_migration"
  | "wildebeest_calving"
  | "lion"
  | "elephant"
  | "flamingo"
  | "rhino"
  | "cheetah"
  | "leopard"
  | "dolphin";

export type TagCode =
  | "business"
  | "family"
  | "couple"
  | "friends"
  | "solo"
  | "luxury"
  | "eco_friendly";

export type CustomerLevel = "bronze" | "silver" | "gold" | "platinum";
