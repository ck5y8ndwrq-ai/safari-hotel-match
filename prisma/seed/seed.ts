// Seed data for Safari Hotel Match
// Run with: npx tsx prisma/seed/seed.ts
import { prisma } from "@/lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.customerPreference.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.hotelTargetSpecies.deleteMany();
  await prisma.hotelTag.deleteMany();
  await prisma.hotelAmenity.deleteMany();
  await prisma.hotelImage.deleteMany();
  await prisma.package.deleteMany();
  await prisma.seasonalPrice.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.region.deleteMany();
  await prisma.country.deleteMany();
  await prisma.amenity.deleteMany();

  // ─── Countries ───
  const tanzania = await prisma.country.create({
    data: { nameZh: "坦桑尼亚", nameEn: "Tanzania", currency: "USD", timezone: "Africa/Dar_es_Salaam" },
  });
  const kenya = await prisma.country.create({
    data: { nameZh: "肯尼亚", nameEn: "Kenya", currency: "USD", timezone: "Africa/Nairobi" },
  });

  // ─── Regions ───
  const serengeti = await prisma.region.create({
    data: { countryId: tanzania.id, nameZh: "塞伦盖蒂国家公园", nameEn: "Serengeti National Park", type: "national_park", highSeasonStart: "07-01", highSeasonEnd: "10-31" },
  });
  const ngorongoro = await prisma.region.create({
    data: { countryId: tanzania.id, nameZh: "恩戈罗恩戈罗保护区", nameEn: "Ngorongoro Conservation Area", type: "reserve" },
  });
  const arusha = await prisma.region.create({
    data: { countryId: tanzania.id, nameZh: "阿鲁沙", nameEn: "Arusha", type: "transit_city" },
  });
  const zanzibar = await prisma.region.create({
    data: { countryId: tanzania.id, nameZh: "桑给巴尔", nameEn: "Zanzibar", type: "beach_island" },
  });
  const masaiMara = await prisma.region.create({
    data: { countryId: kenya.id, nameZh: "马赛马拉国家保护区", nameEn: "Masai Mara National Reserve", type: "national_park", highSeasonStart: "07-01", highSeasonEnd: "10-31" },
  });
  const amboseli = await prisma.region.create({
    data: { countryId: kenya.id, nameZh: "安博塞利国家公园", nameEn: "Amboseli National Park", type: "national_park" },
  });
  const nairobi = await prisma.region.create({
    data: { countryId: kenya.id, nameZh: "内罗毕", nameEn: "Nairobi", type: "transit_city" },
  });

  // ─── Amenities ───
  const amenities = await Promise.all([
    prisma.amenity.create({ data: { code: "wifi", nameZh: "WiFi", category: "facility" } }),
    prisma.amenity.create({ data: { code: "pool", nameZh: "泳池", category: "facility" } }),
    prisma.amenity.create({ data: { code: "restaurant", nameZh: "餐厅", category: "facility" } }),
    prisma.amenity.create({ data: { code: "bar", nameZh: "酒吧", category: "facility" } }),
    prisma.amenity.create({ data: { code: "parking", nameZh: "停车场", category: "facility" } }),
    prisma.amenity.create({ data: { code: "game_drive", nameZh: "游猎观光", category: "activity" } }),
    prisma.amenity.create({ data: { code: "hot_balloon", nameZh: "热气球", category: "activity" } }),
    prisma.amenity.create({ data: { code: "bush_dinner", nameZh: "丛林晚餐", category: "activity" } }),
    prisma.amenity.create({ data: { code: "spa", nameZh: "水疗", category: "facility" } }),
    prisma.amenity.create({ data: { code: "transfer", nameZh: "接送服务", category: "service" } }),
    prisma.amenity.create({ data: { code: "laundry", nameZh: "洗衣服务", category: "service" } }),
    prisma.amenity.create({ data: { code: "nature_walk", nameZh: "自然徒步", category: "activity" } }),
  ]);
  const amenityMap = Object.fromEntries(amenities.map((a) => [a.code, a]));

  // ─── Hotels ───
  // Serengeti hotels
  const serengetiLodge = await prisma.hotel.create({
    data: {
      regionId: serengeti.id, nameZh: "塞伦盖蒂野奢营地", nameEn: "Serengeti Safari Camp",
      accommodationType: "tented_camp", starRating: 5, guestRating: 4.8,
      latitude: -2.3333, longitude: 34.8333,
      distanceToParkGate: 3.5, nearestAirstrip: "Seronera Airstrip", distanceToAirstrip: 8,
      transferProvided: true, hasChineseService: true, hasChineseMenu: false, hasChineseGuide: true,
      totalRooms: 20, descriptionZh: "位于塞伦盖蒂中心的豪华帐篷营地，提供极致游猎体验。每顶帐篷均配有私人观景台。",
      contactPhone: "+255-123-456789",
    },
  });

  const fourSeasonsSerengeti = await prisma.hotel.create({
    data: {
      regionId: serengeti.id, nameZh: "塞伦盖蒂四季游猎酒店", nameEn: "Four Seasons Safari Lodge Serengeti",
      accommodationType: "safari_lodge", starRating: 5, guestRating: 4.9,
      latitude: -2.4167, longitude: 34.7500,
      distanceToParkGate: 2, nearestAirstrip: "Seronera Airstrip", distanceToAirstrip: 5,
      transferProvided: true, hasChineseService: true, hasChineseMenu: true, hasChineseGuide: true,
      totalRooms: 75, descriptionZh: "五星级游猎酒店，配备无边泳池、水疗中心和顶级餐厅。俯瞰塞伦盖蒂草原。",
      contactPhone: "+255-123-456001",
    },
  });

  // Ngorongoro hotels
  const ngorongoroLodge = await prisma.hotel.create({
    data: {
      regionId: ngorongoro.id, nameZh: "恩戈罗恩戈罗火山口酒店", nameEn: "Ngorongoro Crater Lodge",
      accommodationType: "safari_lodge", starRating: 5, guestRating: 4.7,
      latitude: -3.1667, longitude: 35.5500,
      distanceToParkGate: 1, nearestAirstrip: "Lake Manyara Airstrip", distanceToAirstrip: 45,
      transferProvided: true, hasChineseService: false,
      totalRooms: 30, descriptionZh: "坐落在火山口边缘的奢华酒店，壮丽的火山口景观。",
      contactPhone: "+255-123-456002",
    },
  });

  // Arusha hotels
  const arushaHotel = await prisma.hotel.create({
    data: {
      regionId: arusha.id, nameZh: "阿鲁沙中转酒店", nameEn: "Arusha Transit Hotel",
      accommodationType: "city_hotel", starRating: 4, guestRating: 4.2,
      latitude: -3.3667, longitude: 36.6833,
      transferProvided: true, hasChineseService: true,
      totalRooms: 60, descriptionZh: "位于阿鲁沙市中心的中转酒店，方便前往各个国家公园。",
      contactPhone: "+255-123-456003",
    },
  });

  // Zanzibar hotels
  const zanzibarResort = await prisma.hotel.create({
    data: {
      regionId: zanzibar.id, nameZh: "桑给巴尔海滩度假村", nameEn: "Zanzibar Beach Resort",
      accommodationType: "beach_resort", starRating: 5, guestRating: 4.6,
      latitude: -6.1667, longitude: 39.1833,
      transferProvided: true, hasChineseService: true, hasChineseMenu: true,
      totalRooms: 120, descriptionZh: "坐落在桑给巴尔北部的白沙滩，提供水疗、潜水和多种水上活动。",
      contactPhone: "+255-123-456004",
    },
  });

  // Masai Mara hotels
  const maraCamp = await prisma.hotel.create({
    data: {
      regionId: masaiMara.id, nameZh: "马赛马拉豪华帐篷营地", nameEn: "Mara Luxury Tented Camp",
      accommodationType: "tented_camp", starRating: 4, guestRating: 4.8,
      latitude: -1.4833, longitude: 35.0000,
      distanceToParkGate: 2, nearestAirstrip: "Mara Serena Airstrip", distanceToAirstrip: 10,
      transferProvided: true, hasChineseService: false, hasChineseGuide: true,
      totalRooms: 15, descriptionZh: "位于马赛马拉核心区的精品帐篷营地，靠近动物迁徙路线。",
      contactPhone: "+254-123-456001",
    },
  });

  const maraLodge = await prisma.hotel.create({
    data: {
      regionId: masaiMara.id, nameZh: "马赛马拉游猎酒店", nameEn: "Mara Safari Lodge",
      accommodationType: "safari_lodge", starRating: 4, guestRating: 4.5,
      latitude: -1.4500, longitude: 35.0333,
      distanceToParkGate: 5, nearestAirstrip: "Mara Serena Airstrip", distanceToAirstrip: 15,
      transferProvided: true, hasChineseService: true,
      totalRooms: 40, descriptionZh: "在马赛马拉河边的高品质游猎酒店，性价比之选。",
      contactPhone: "+254-123-456002",
    },
  });

  // Amboseli hotels
  const amboseliLodge = await prisma.hotel.create({
    data: {
      regionId: amboseli.id, nameZh: "安博塞利观山大酒店", nameEn: "Amboseli View Lodge",
      accommodationType: "safari_lodge", starRating: 3, guestRating: 4.3,
      latitude: -2.6500, longitude: 37.2500,
      distanceToParkGate: 1, nearestAirstrip: "Amboseli Airstrip", distanceToAirstrip: 3,
      transferProvided: true, hasChineseService: false,
      totalRooms: 50, descriptionZh: "直面乞力马扎罗山的景观酒店，大象群就在眼前。",
      contactPhone: "+254-123-456003",
    },
  });

  // Nairobi hotels
  const nairobiHotel = await prisma.hotel.create({
    data: {
      regionId: nairobi.id, nameZh: "内罗毕商务酒店", nameEn: "Nairobi Business Hotel",
      accommodationType: "city_hotel", starRating: 4, guestRating: 4.0,
      latitude: -1.2833, longitude: 36.8167,
      transferProvided: true, hasChineseService: true, hasChineseMenu: true, hasChineseGuide: true,
      totalRooms: 100, descriptionZh: "位于内罗毕市中心，交通便利，适合商务出行和中转停留。",
      contactPhone: "+254-123-456004",
    },
  });

  const hotels = [serengetiLodge, fourSeasonsSerengeti, ngorongoroLodge, arushaHotel, zanzibarResort, maraCamp, maraLodge, amboseliLodge, nairobiHotel];

  // ─── Room Types & Seasonal Prices ───
  const now = new Date();
  const highStart = new Date(now.getFullYear(), 6, 1);
  const highEnd = new Date(now.getFullYear(), 9, 31);
  const shoulderStart = new Date(now.getFullYear(), 0, 1);
  const shoulderEnd = new Date(now.getFullYear(), 1, 28);
  const lowStart = new Date(now.getFullYear(), 2, 1);
  const lowEnd = new Date(now.getFullYear(), 4, 31);

  const roomConfigs = [
    { hotelId: serengetiLodge.id, types: [{ name: "豪华帐篷", cat: "tent", guests: 2, prices: { high: 1200, shoulder: 800, low: 500 } }, { name: "家庭帐篷", cat: "tent", guests: 4, prices: { high: 2000, shoulder: 1400, low: 900 } }] },
    { hotelId: fourSeasonsSerengeti.id, types: [{ name: "草原景观房", cat: "deluxe_room", guests: 2, prices: { high: 1500, shoulder: 1000, low: 700 } }, { name: "总统套房", cat: "suite", guests: 2, prices: { high: 3500, shoulder: 2500, low: 1800 } }] },
    { hotelId: ngorongoroLodge.id, types: [{ name: "火山口景观套房", cat: "suite", guests: 2, prices: { high: 1800, shoulder: 1200, low: 800 } }] },
    { hotelId: arushaHotel.id, types: [{ name: "标准间", cat: "standard_room", guests: 2, prices: { high: 150, shoulder: 120, low: 100 } }, { name: "商务套房", cat: "suite", guests: 2, prices: { high: 280, shoulder: 220, low: 180 } }] },
    { hotelId: zanzibarResort.id, types: [{ name: "海景房", cat: "deluxe_room", guests: 2, prices: { high: 400, shoulder: 300, low: 200 } }, { name: "别墅套房", cat: "villa", guests: 4, prices: { high: 800, shoulder: 600, low: 400 } }] },
    { hotelId: maraCamp.id, types: [{ name: "豪华帐篷", cat: "tent", guests: 2, prices: { high: 900, shoulder: 600, low: 400 } }] },
    { hotelId: maraLodge.id, types: [{ name: "标准间", cat: "standard_room", guests: 2, prices: { high: 500, shoulder: 350, low: 250 } }, { name: "家庭房", cat: "family_room", guests: 4, prices: { high: 800, shoulder: 550, low: 400 } }] },
    { hotelId: amboseliLodge.id, types: [{ name: "标准间", cat: "standard_room", guests: 2, prices: { high: 350, shoulder: 250, low: 180 } }, { name: "家庭房", cat: "family_room", guests: 4, prices: { high: 600, shoulder: 450, low: 320 } }] },
    { hotelId: nairobiHotel.id, types: [{ name: "标准间", cat: "standard_room", guests: 2, prices: { high: 200, shoulder: 160, low: 120 } }, { name: "商务套房", cat: "suite", guests: 2, prices: { high: 350, shoulder: 280, low: 220 } }] },
  ];

  for (const cfg of roomConfigs) {
    for (const t of cfg.types) {
      const roomType = await prisma.roomType.create({
        data: { hotelId: cfg.hotelId, nameZh: t.name, roomCategory: t.cat, maxGuests: t.guests, bedType: t.name.includes("家庭") ? "大床+加床" : "大床/双床" },
      });

      const prices = t.prices as { high: number; shoulder: number; low: number };
      for (const [season, price] of Object.entries(prices)) {
        const [sStart, sEnd] = season === "high" ? [highStart, highEnd] : season === "shoulder" ? [shoulderStart, shoulderEnd] : [lowStart, lowEnd];
        await prisma.seasonalPrice.create({
          data: { hotelId: cfg.hotelId, roomTypeId: roomType.id, seasonName: season, dateStart: sStart, dateEnd: sEnd, priceRoomOnly: price, priceFullBoard: Math.round(price * 1.6), priceAllInclusive: Math.round(price * 2.2), isAvailable: true },
        });
      }
    }
  }

  // ─── Hotel Tags ───
  const tagData: { hotelId: number; tagCode: string }[] = [
    { hotelId: serengetiLodge.id, tagCode: "luxury" }, { hotelId: serengetiLodge.id, tagCode: "couple" }, { hotelId: serengetiLodge.id, tagCode: "eco_friendly" },
    { hotelId: fourSeasonsSerengeti.id, tagCode: "luxury" }, { hotelId: fourSeasonsSerengeti.id, tagCode: "business" }, { hotelId: fourSeasonsSerengeti.id, tagCode: "family" },
    { hotelId: ngorongoroLodge.id, tagCode: "luxury" }, { hotelId: ngorongoroLodge.id, tagCode: "couple" },
    { hotelId: arushaHotel.id, tagCode: "business" }, { hotelId: arushaHotel.id, tagCode: "solo" },
    { hotelId: zanzibarResort.id, tagCode: "couple" }, { hotelId: zanzibarResort.id, tagCode: "family" }, { hotelId: zanzibarResort.id, tagCode: "luxury" },
    { hotelId: maraCamp.id, tagCode: "eco_friendly" }, { hotelId: maraCamp.id, tagCode: "couple" }, { hotelId: maraCamp.id, tagCode: "friends" },
    { hotelId: maraLodge.id, tagCode: "family" }, { hotelId: maraLodge.id, tagCode: "friends" },
    { hotelId: amboseliLodge.id, tagCode: "family" }, { hotelId: amboseliLodge.id, tagCode: "friends" }, { hotelId: amboseliLodge.id, tagCode: "eco_friendly" },
    { hotelId: nairobiHotel.id, tagCode: "business" }, { hotelId: nairobiHotel.id, tagCode: "solo" },
  ];
  for (const t of tagData) {
    await prisma.hotelTag.create({ data: { hotelId: t.hotelId, tagCode: t.tagCode, weight: 3 } });
  }

  // ─── Hotel Amenities ───
  const amenityLinks: { hotelId: number; codes: string[] }[] = [
    { hotelId: serengetiLodge.id, codes: ["wifi", "restaurant", "bar", "game_drive", "bush_dinner", "transfer", "laundry", "nature_walk"] },
    { hotelId: fourSeasonsSerengeti.id, codes: ["wifi", "pool", "restaurant", "bar", "spa", "game_drive", "hot_balloon", "bush_dinner", "transfer", "laundry"] },
    { hotelId: ngorongoroLodge.id, codes: ["wifi", "restaurant", "bar", "game_drive", "transfer", "laundry"] },
    { hotelId: arushaHotel.id, codes: ["wifi", "restaurant", "bar", "parking", "transfer", "laundry"] },
    { hotelId: zanzibarResort.id, codes: ["wifi", "pool", "restaurant", "bar", "spa", "transfer", "laundry"] },
    { hotelId: maraCamp.id, codes: ["restaurant", "bar", "game_drive", "bush_dinner", "transfer", "nature_walk"] },
    { hotelId: maraLodge.id, codes: ["wifi", "restaurant", "bar", "pool", "game_drive", "transfer", "laundry"] },
    { hotelId: amboseliLodge.id, codes: ["wifi", "restaurant", "bar", "pool", "game_drive", "parking"] },
    { hotelId: nairobiHotel.id, codes: ["wifi", "restaurant", "bar", "parking", "transfer", "laundry"] },
  ];
  for (const link of amenityLinks) {
    for (const code of link.codes) {
      if (amenityMap[code]) {
        await prisma.hotelAmenity.create({ data: { hotelId: link.hotelId, amenityId: amenityMap[code].id, isFree: code !== "spa" } });
      }
    }
  }

  // ─── Target Species ───
  await prisma.hotelTargetSpecies.createMany({
    data: [
      { hotelId: serengetiLodge.id, species: "wildebeest_migration", bestSeasonStart: 7, bestSeasonEnd: 10 },
      { hotelId: serengetiLodge.id, species: "lion", bestSeasonStart: 6, bestSeasonEnd: 10 },
      { hotelId: fourSeasonsSerengeti.id, species: "wildebeest_migration", bestSeasonStart: 7, bestSeasonEnd: 10 },
      { hotelId: fourSeasonsSerengeti.id, species: "cheetah", bestSeasonStart: 6, bestSeasonEnd: 9 },
      { hotelId: ngorongoroLodge.id, species: "rhino", bestSeasonStart: 1, bestSeasonEnd: 12 },
      { hotelId: ngorongoroLodge.id, species: "lion", bestSeasonStart: 1, bestSeasonEnd: 12 },
      { hotelId: maraCamp.id, species: "wildebeest_migration", bestSeasonStart: 7, bestSeasonEnd: 10 },
      { hotelId: maraCamp.id, species: "lion", bestSeasonStart: 7, bestSeasonEnd: 10 },
      { hotelId: maraCamp.id, species: "leopard", bestSeasonStart: 7, bestSeasonEnd: 10 },
      { hotelId: maraLodge.id, species: "wildebeest_migration", bestSeasonStart: 7, bestSeasonEnd: 10 },
      { hotelId: maraLodge.id, species: "elephant", bestSeasonStart: 1, bestSeasonEnd: 12 },
      { hotelId: amboseliLodge.id, species: "elephant", bestSeasonStart: 1, bestSeasonEnd: 12 },
      { hotelId: amboseliLodge.id, species: "lion", bestSeasonStart: 1, bestSeasonEnd: 12 },
      { hotelId: zanzibarResort.id, species: "dolphin", bestSeasonStart: 6, bestSeasonEnd: 10 },
    ],
  });

  // ─── Customers ───
  const customer1 = await prisma.customer.create({
    data: { name: "青旅国旅", contactPerson: "李经理", contactPhone: "138-0001-0001", level: "gold" },
  });
  const customer2 = await prisma.customer.create({
    data: { name: "万里旅行", contactPerson: "王总", contactPhone: "138-0002-0002", level: "silver" },
  });
  const customer3 = await prisma.customer.create({
    data: { name: "非洲之梦旅行社", contactPerson: "张先生", contactPhone: "138-0003-0003", level: "platinum" },
  });

  // Customer preferences
  await prisma.customerPreference.createMany({
    data: [
      { customerId: customer1.id, prefKey: "price_min", prefValue: "200" },
      { customerId: customer1.id, prefKey: "price_max", prefValue: "800" },
      { customerId: customer1.id, prefKey: "star_min", prefValue: "4" },
      { customerId: customer1.id, prefKey: "accommodation_type", prefValue: "safari_lodge" },
      { customerId: customer1.id, prefKey: "has_chinese", prefValue: "true" },
      { customerId: customer2.id, prefKey: "price_min", prefValue: "100" },
      { customerId: customer2.id, prefKey: "price_max", prefValue: "500" },
      { customerId: customer2.id, prefKey: "accommodation_type", prefValue: "city_hotel" },
      { customerId: customer3.id, prefKey: "price_min", prefValue: "500" },
      { customerId: customer3.id, prefKey: "price_max", prefValue: "2000" },
      { customerId: customer3.id, prefKey: "star_min", prefValue: "5" },
      { customerId: customer3.id, prefKey: "has_chinese", prefValue: "true" },
      { customerId: customer3.id, prefKey: "need_transfer", prefValue: "true" },
    ],
  });

  // ─── Sample Order ───
  const order = await prisma.booking.create({
    data: {
      orderNo: "TR20260516-001", customerId: customer1.id, status: "confirmed",
      totalAmount: 2400, currency: "USD", tripPurpose: "family", groupType: "with_children",
      totalGuests: 4, checkIn: new Date("2026-08-01"), checkOut: new Date("2026-08-04"),
      remark: "家庭出游，两个大人两个孩子，需要高楼层安静房间",
      items: {
        create: [
          { hotelId: maraLodge.id, roomTypeId: undefined, seq: 1, checkIn: new Date("2026-08-01"), checkOut: new Date("2026-08-04"), nights: 3, boardBasis: "full_board", unitPrice: 800, quantity: 2, subtotal: 2400 },
        ],
      },
    },
  });

  console.log("✅ Seed complete!");
  console.log(`   Countries: 2`);
  console.log(`   Regions: ${await prisma.region.count()}`);
  console.log(`   Hotels: ${await prisma.hotel.count()}`);
  console.log(`   Room Types: ${await prisma.roomType.count()}`);
  console.log(`   Seasonal Prices: ${await prisma.seasonalPrice.count()}`);
  console.log(`   Amenities: ${await prisma.amenity.count()}`);
  console.log(`   Customers: ${await prisma.customer.count()}`);
  console.log(`   Orders: ${await prisma.booking.count()}`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
