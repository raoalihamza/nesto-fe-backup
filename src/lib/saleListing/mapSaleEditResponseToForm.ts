import type {
  SaleListingEditResponse,
  SaleValidatedAddress,
} from "@/lib/api/saleListing.service";
import type { SaleMediaItem } from "@/lib/api/saleListingMedia.service";
import type {
  SaleFormData,
  SaleListingPhoto,
  OpenHouseEntry,
} from "@/lib/saleListing/saleListingFormTypes";
import { createEmptySaleFormData } from "@/lib/saleListing/saleListingFormTypes";
import { formatReduxMoneyForInput } from "@/lib/rentListing/optionalMoneyField";
import {
  ARCHITECTURE_TYPE_OPTIONS,
  ELECTRIC_OPTIONS,
  HOME_TYPES,
  LOT_SIZE_UNITS,
  STYLE_TYPE_OPTIONS,
  WATER_HEATER_OPTIONS,
  WATER_OPTIONS,
} from "@/lib/saleListing/saleListingFormConstants";

const ALLOWED_LOT_SIZE_UNITS = new Set<string>(LOT_SIZE_UNITS);

/** Legacy `lotSizeUnit` values from older API responses → current API keys. */
const LEGACY_LOT_SIZE_UNIT: Record<string, (typeof LOT_SIZE_UNITS)[number]> = {
  sqft: "sqmeter",
  acres: "acre",
};

function mapLotSizeUnitFromApi(raw: string | null | undefined): string {
  const v = (raw ?? "").toString().trim().toLowerCase();
  if (!v) return "";
  if (ALLOWED_LOT_SIZE_UNITS.has(v)) return v;
  const mapped = LEGACY_LOT_SIZE_UNIT[v];
  return mapped ?? "";
}

// Inverse lookup tables for fields where UI keys intentionally differ from
// API values (see `buildSaleListingPayload.ts`).

const HEATING_FUEL_REVERSE: Record<string, (typeof WATER_HEATER_OPTIONS)[number]> = {
  gas: "gas_heater",
  electric: "electric_heater",
  solar: "solar_heater",
  none: "none_heater",
};

const VIEW_REVERSE: Record<string, (typeof STYLE_TYPE_OPTIONS)[number]> = {
  city: "city",
  territorial: "territorial",
  mountain: "mountain",
  park: "park",
  water: "water",
  none: "none_style",
};

const ARCHITECTURAL_STYLE_REVERSE: Record<
  string,
  (typeof ARCHITECTURE_TYPE_OPTIONS)[number]
> = {
  other: "other_arch",
};

const ELECTRIC_TYPE_REVERSE: Record<
  string,
  (typeof ELECTRIC_OPTIONS)[number]
> = {
  other: "other_electric",
};

const WATER_TYPE_REVERSE: Record<string, (typeof WATER_OPTIONS)[number]> = {
  none: "none_water",
};

function toStringOrEmpty(
  value: number | string | null | undefined
): string {
  if (value == null) return "";
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }
  return String(value);
}

function toNumberOrNull(
  value: number | string | null | undefined
): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function stringArray(value: string[] | null | undefined): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.length > 0);
}

function mapHomeTypeFromApi(raw: string | null | undefined): string {
  const v = (raw ?? "").trim();
  if (!v) return "";
  const allowed = new Set<string>(HOME_TYPES as readonly string[]);
  if (allowed.has(v)) return v;
  if (v === "land") return "lot_land";
  return v;
}

function mapWaterHeaterFromApi(
  heatingFuel: string[] | null | undefined
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of stringArray(heatingFuel)) {
    const mapped = HEATING_FUEL_REVERSE[raw] ?? raw;
    if (!seen.has(mapped)) {
      seen.add(mapped);
      out.push(mapped);
    }
  }
  return out;
}

function mapElectricFromApi(
  electricType: string[] | null | undefined
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of stringArray(electricType)) {
    const mapped = ELECTRIC_TYPE_REVERSE[raw] ?? raw;
    if (!seen.has(mapped)) {
      seen.add(mapped);
      out.push(mapped);
    }
  }
  return out;
}

function mapWaterFromApi(
  waterType: string[] | null | undefined
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of stringArray(waterType)) {
    const mapped = WATER_TYPE_REVERSE[raw] ?? raw;
    if (!seen.has(mapped)) {
      seen.add(mapped);
      out.push(mapped);
    }
  }
  return out;
}

function mapStyleTypeFromApi(view: string[] | null | undefined): string {
  const arr = stringArray(view);
  if (arr.length === 0) return "";
  const first = arr[0];
  const mapped = VIEW_REVERSE[first];
  if (mapped) return mapped;
  const opts = STYLE_TYPE_OPTIONS as readonly string[];
  return opts.includes(first)
    ? (first as (typeof STYLE_TYPE_OPTIONS)[number])
    : "";
}

function mapArchitectureTypeFromApi(
  raw: string | null | undefined
): string {
  const v = (raw ?? "").trim();
  if (!v) return "";
  return ARCHITECTURAL_STYLE_REVERSE[v] ?? v;
}

function mapOpenHouses(
  entries: SaleListingEditResponse["openHouses"]
): OpenHouseEntry[] {
  if (!Array.isArray(entries)) return [];
  return entries
    .filter(
      (
        o
      ): o is { date: string; startTime: string; endTime: string } =>
        Boolean(o && o.date && o.startTime && o.endTime)
    )
    .map((o) => ({
      date: o.date,
      startTime: o.startTime,
      endTime: o.endTime,
    }));
}

/** Map a confirmed listing media item to the form's photo shape. */
export function mapListingMediaToPhoto(item: SaleMediaItem): SaleListingPhoto {
  return {
    id: item.id,
    url: item.url,
    fileName: item.fileName,
    fileSizeBytes: item.fileSizeBytes,
  };
}

export function mapListingMediaListToPhotos(
  items: SaleMediaItem[] | null | undefined
): SaleListingPhoto[] {
  if (!Array.isArray(items)) return [];
  return [...items]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map(mapListingMediaToPhoto);
}

/** Build a `SaleValidatedAddress` from the GET edit `location` block. */
export function mapEditResponseToValidatedAddress(
  resp: SaleListingEditResponse
): SaleValidatedAddress | null {
  const loc = resp.location;
  if (!loc) return null;

  const addressLine1 = (loc.addressLine1 ?? "").trim();
  const city = (loc.city ?? "").trim();
  const state = (loc.state ?? loc.stateCode ?? "").trim();
  const postalCode = (loc.postalCode ?? "").trim();
  const countryCode = (loc.countryCode ?? "").trim();
  const lat = typeof loc.latitude === "number" ? loc.latitude : 0;
  const lng = typeof loc.longitude === "number" ? loc.longitude : 0;

  return {
    formattedAddress:
      (loc.formattedAddress ?? "").trim() ||
      [addressLine1, city, state, postalCode].filter(Boolean).join(", "),
    addressLine1,
    unit: loc.unit ?? loc.addressLine2 ?? undefined,
    city,
    state,
    postalCode,
    countryCode,
    latitude: lat,
    longitude: lng,
    isValid: true,
  };
}

/**
 * Map `GET /listings/sale/:id/edit` + confirmed media list into RHF form state.
 * Existing photos arrive from `GET /listings/sale/:id/media` and are merged here
 * so the photo grid renders from the same `SaleFormData.photos` shape used by create.
 */
export function mapSaleEditResponseToFormData(
  resp: SaleListingEditResponse,
  mediaItems: SaleMediaItem[] | null | undefined
): SaleFormData {
  const empty = createEmptySaleFormData();

  const pricingPrice = toNumberOrNull(resp.pricingMedia?.askingPrice);

  const hf = resp.homeFacts ?? {};
  const ah = resp.additionalInformation ?? {};
  const rd = resp.roomDetails ?? {};
  const ud = resp.utilityDetails ?? {};
  const bd = resp.buildingDetails ?? {};
  const contact = resp.contactInformation ?? {};

  const basementArr = stringArray(rd.basement);

  return {
    ...empty,
    price: formatReduxMoneyForInput(pricingPrice),
    photos: mapListingMediaListToPhotos(mediaItems),
    virtualTourUrl: (resp.pricingMedia?.virtualTourUrl ?? "").trim(),
    tourUrl3D: "",
    homeType: mapHomeTypeFromApi(hf.homeType),
    hoaDues: toStringOrEmpty(hf.hoaDues),
    beds: toStringOrEmpty(hf.beds),
    squareFootage: toStringOrEmpty(hf.basementSqFt),
    garageSqFt: toStringOrEmpty(hf.garageSqFt),
    fullBaths: toStringOrEmpty(hf.fullBaths),
    threeFourthBaths: toStringOrEmpty(hf.threeQuarterBaths),
    halfBaths: toStringOrEmpty(hf.halfBaths),
    quarterBaths: toStringOrEmpty(hf.quarterBaths),
    description: (hf.homeDescription ?? "").toString(),
    finishedSqFt: toStringOrEmpty(hf.finishedSquareFeet),
    lotSize: toStringOrEmpty(hf.lotSize),
    lotSizeUnit:
      mapLotSizeUnitFromApi(hf.lotSizeUnit) || empty.lotSizeUnit,
    yearBuilt: toStringOrEmpty(hf.yearBuilt),
    structuralRemodelYear: toStringOrEmpty(hf.structuralRemodelYear),
    openHouseDates: mapOpenHouses(resp.openHouses),
    realtorWebsite: (ah.relatedWebsiteUrl ?? "").toString(),
    additionalInfo: (ah.whatILoveAboutThisHome ?? "").toString(),
    rooms: stringArray(rd.rooms),
    totalRooms: toStringOrEmpty(rd.totalRooms),
    basement: basementArr[0] ?? "",
    appliances: stringArray(rd.appliances),
    flooring: stringArray(rd.floorCovering),
    heating: stringArray(ud.heatingType),
    cooling: stringArray(ud.coolingType),
    waterHeater: mapWaterHeaterFromApi(ud.heatingFuel),
    electric: mapElectricFromApi(ud.electricType),
    water: mapWaterFromApi(ud.waterType),
    // `indoorFeatures` on the API maps to `exteriorFeatures` in the UI form.
    exteriorFeatures: stringArray(rd.indoorFeatures),
    buildingAmenities: stringArray(bd.buildingAmenities),
    architectureType: mapArchitectureTypeFromApi(bd.architecturalStyle),
    styleType: mapStyleTypeFromApi(bd.view),
    exteriorMaterial: stringArray(bd.exterior),
    outdoorAmenities: stringArray(bd.outdoorAmenities),
    stories: toStringOrEmpty(bd.numberOfStories),
    parking: stringArray(bd.parking),
    parkingSpaces: toStringOrEmpty(bd.parkingSpaces),
    roof: stringArray(bd.roof),
    contactPhone: (contact.phoneNumber ?? "").trim(),
    // Published listings have already accepted terms; treat as satisfied for edit.
    agreedToTerms: true,
  };
}
