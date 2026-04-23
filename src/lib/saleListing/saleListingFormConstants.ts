/** Shared option lists for sale listing form (UI + validation). */

/** `homeFacts.homeDescription` — backend max length. */
export const SALE_LISTING_DESCRIPTION_MAX_CHARS = 10_000;

/** `additionalInformation.whatILoveAboutThisHome` — backend max length. */
export const SALE_LISTING_ADDITIONAL_INFO_MAX_CHARS = 4_000;

export const HOME_TYPES = [
  "single_family",
  "apartment",
  "condo",
  "townhouse",
  "multi_family",
  "manufactured",
  "lot_land",
  "other",
] as const;

/** API `homeFacts.lotSizeUnit` — backend accepts only these values. */
export const LOT_SIZE_UNITS = ["acre", "sqmeter", "hectare"] as const;

/** Radix Select cannot use empty string as item value; maps to optional year fields as "". */
export const YEAR_SELECT_SENTINEL = "__none__";

export const TIME_OPTIONS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00",
] as const;

/** API-aligned. See SALE_LISTING_FRONTEND_GUIDE §10 / roomDetails.appliances enum. */
export const APPLIANCE_OPTIONS = [
  "dishwasher", "dryer", "freezer", "garbage_disposal",
  "microwave", "range_oven", "refrigerator", "trash_compactor",
  "washer",
] as const;

/** API-aligned. roomDetails.floorCovering enum. */
export const FLOORING_OPTIONS = [
  "carpet", "concrete",
  "hardwood", "laminate",
  "linoleum_vinyl", "slate",
  "softwood", "tile",
  "other",
] as const;

/** API-aligned. roomDetails.rooms enum. */
export const ROOM_OPTIONS = [
  "breakfast_nook", "dining_room",
  "family_room", "laundry_room",
  "library", "master_bath",
  "mud_room", "office",
  "pantry", "recreation_room",
  "solarium_atrium", "sun_room",
  "walk_in_closet", "workshop",
] as const;

/** API `roomDetails.basement` — max one value in payload. */
export const BASEMENT_OPTIONS = [
  "finished",
  "partially_finished",
  "unfinished",
  "none",
] as const;

/** API `utilityDetails.heatingFuel` (UI still uses form field `waterHeater`). */
export const HEATING_FUEL_OPTIONS = [
  "coal",
  "electric",
  "gas",
  "oil",
  "propane_butane",
  "solar",
  "wood_pellet",
  "other",
  "none",
] as const;

/** API-aligned. See SALE_LISTING_FRONTEND_GUIDE / roomDetails.indoorFeatures enum. */
export const INDOOR_FEATURES = [
  "attic", "cable_ready",
  "ceiling_fans", "double_pane_storm_windows",
  "fireplace", "intercom_system",
  "jetter_tub", "mother_in_law_apartment",
  "security_system", "skylights",
  "vaulted_ceiling", "wet_bar",
  "wired",
] as const;

/** API-aligned. utilityDetails.coolingType enum. `none` is mutually exclusive. */
export const COOLING_OPTIONS = [
  "central", "evaporative",
  "geothermal", "refrigeration",
  "solar", "wall",
  "other", "none",
] as const;

/** API-aligned. utilityDetails.heatingType enum. */
export const HEATING_OPTIONS = [
  "baseboard", "forced_air",
  "geothermal", "heat_pump",
  "radiant", "stove",
  "wall", "other",
] as const;

export const ELECTRIC_OPTIONS = [
  "110_volt", "220_volt", "circuit_breakers", "other_electric",
] as const;

export const WATER_OPTIONS = ["city_water", "well", "none_water"] as const;

/** @deprecated Use `HEATING_FUEL_OPTIONS` — alias for imports. */
export const WATER_HEATER_OPTIONS = HEATING_FUEL_OPTIONS;

/** API-aligned. buildingDetails.buildingAmenities enum. */
export const BUILDING_AMENITY_OPTIONS = [
  "assisted_living_community", "basketball_court",
  "controlled_access", "disabled_access",
  "doorman", "elevator",
  "fitness_center", "gated_entry",
  "near_transportation", "over_55_active_community",
  "sports_court", "storage",
  "tennis_court",
] as const;

export const ARCHITECTURE_TYPE_OPTIONS = [
  "bungalow", "modern", "ranch_rambler",
  "cape_cod", "queen_anne_victorian",
  "colonial", "santa_fe_pueblo_style",
  "contemporary", "spanish",
  "craftsman", "split_level",
  "french", "tudor",
  "georgian", "loft_arch",
  "other_arch",
] as const;

/** API-aligned. buildingDetails.exterior enum. */
export const EXTERIOR_MATERIAL_OPTIONS = [
  "brick", "cement_concrete",
  "composition", "metal",
  "shingle", "stone",
  "stucco", "vinyl",
  "wood", "wood_products",
  "other",
] as const;

/** API-aligned. buildingDetails.outdoorAmenities enum. */
export const OUTDOOR_AMENITY_OPTIONS = [
  "balcony_patio", "barbecue_area",
  "deck", "dock",
  "fenced_yard", "garden",
  "greenhouse", "hot_tub_spa",
  "lawn", "pond",
  "pool", "porch",
  "rv_parking", "sauna",
  "sprinkler_system", "waterfront",
] as const;

/** API-aligned. buildingDetails.parking enum. `none` is mutually exclusive. */
export const PARKING_OPTIONS = [
  "carport", "garage_attached",
  "garage_detached", "off_street",
  "on_street", "rv_parking",
  "none",
] as const;

/** API-aligned. buildingDetails.roof enum. */
export const ROOF_OPTIONS = [
  "asphalt", "built_up",
  "composition", "metal",
  "shake_shingle", "slate",
  "tile", "other",
] as const;

/** API `buildingDetails.view` — backend accepts only these values (single radio maps 1:1 except `none_style` → `none`). */
export const STYLE_TYPE_OPTIONS = [
  "city",
  "territorial",
  "mountain",
  "park",
  "water",
  "none_style",
] as const;
