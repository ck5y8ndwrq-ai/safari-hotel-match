export const ACCOMMODATION_TYPES = [
  { value: "tented_camp", label: "野奢帐篷营地" },
  { value: "safari_lodge", label: "游猎酒店" },
  { value: "eco_lodge", label: "生态度假屋" },
  { value: "beach_resort", label: "海边度假村" },
  { value: "city_hotel", label: "城市酒店" },
] as const;

export const ACCOMMODATION_TYPE_MAP: Record<string, string> = {
  tented_camp: "野奢帐篷营地",
  safari_lodge: "游猎酒店",
  eco_lodge: "生态度假屋",
  beach_resort: "海边度假村",
  city_hotel: "城市酒店",
};
