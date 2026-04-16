import type { SaleValidatedAddress } from "@/lib/api/saleListing.service";
import type { SaleFormData } from "@/lib/saleListing/saleListingFormTypes";
import {
  APPLIANCE_OPTIONS,
  BASEMENT_OPTIONS,
  BUILDING_AMENITY_OPTIONS,
  COOLING_OPTIONS,
  EXTERIOR_MATERIAL_OPTIONS,
  FLOORING_OPTIONS,
  HEATING_OPTIONS,
  INDOOR_FEATURES,
  OUTDOOR_AMENITY_OPTIONS,
  PARKING_OPTIONS,
  ROOF_OPTIONS,
  ROOM_OPTIONS,
} from "@/lib/saleListing/saleListingFormConstants";

// ─── Mapping helpers ─────────────────────────────────────────────────────
// Most enum arrays: UI option keys already equal API enum values (see
// `saleListingFormConstants.ts`). The small tables below cover groups
// where UI keys intentionally differ from API values.

function toApiSnake(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

/**
 * Dedupe and keep only values present in the API allowlist. Also normalises
 * casing/whitespace defensively. Protects against stale form state that may
 * still carry retired option keys (e.g. after a constants refactor).
 */
function filterToAllowlist<T extends string>(
  values: string[],
  allowlist: readonly T[]
): T[] {
  const allowed = new Set<string>(allowlist);
  const seen = new Set<string>();
  const out: T[] = [];
  for (const raw of values) {
    const v = toApiSnake(raw);
    if (!v || !allowed.has(v) || seen.has(v)) continue;
    seen.add(v);
    out.push(v as T);
  }
  return out;
}

// Water heater UI key → heatingFuel API enum.
const HEATING_FUEL: Record<string, string> = {
  gas_heater: "gas",
  electric_heater: "electric",
  solar_heater: "solar",
  none_heater: "none",
};

// Style UI key → view API enum.
const VIEW: Record<string, string> = {
  city: "city",
  territorial: "territorial",
  mountain: "mountain",
  none_style: "none",
  field: "field",
};

// Architecture UI key → architecturalStyle API enum.
const ARCHITECTURAL_STYLE: Record<string, string> = {
  other_arch: "other",
};

function mapWithTable(value: string, table: Record<string, string>): string {
  const v = toApiSnake(value);
  if (!v) return v;
  return table[v] ?? v;
}

function mapArray(
  values: string[],
  table: Record<string, string>
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const m = mapWithTable(raw, table);
    if (!m || seen.has(m)) continue;
    seen.add(m);
    out.push(m);
  }
  return out;
}

// ─── Payload builder ─────────────────────────────────────────────────────

function parseOptionalInt(value: string): number | undefined {
  const t = value.trim();
  if (!t) return undefined;
  const n = Number.parseInt(t, 10);
  return Number.isFinite(n) ? n : undefined;
}

function parseOptionalFloat(value: string): number | undefined {
  const t = value.trim();
  if (!t) return undefined;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : undefined;
}

function parseRequiredNonNegativeInt(value: string, label: string): number {
  const t = value.trim();
  if (!t) throw new Error(`${label} is required.`);
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${label} must be a non-negative number.`);
  }
  return n;
}

function mapHomeType(raw: string): string {
  if (raw === "land") return "lot_land";
  return raw;
}

/** Build POST /listings/sale body from validated address + form state. */
export function buildCreateSaleListingBody(
  validated: SaleValidatedAddress,
  formData: SaleFormData
): import("@/lib/api/saleListing.service").CreateSaleListingRequest {
  if (formData.price == null || formData.price <= 0) {
    throw new Error("Asking price must be a positive number.");
  }
  if (!formData.homeType.trim()) {
    throw new Error("Home type is required.");
  }
  const homeDescription = formData.description.trim();
  if (!homeDescription) {
    throw new Error("Home description is required.");
  }

  const lotSize = parseOptionalFloat(formData.lotSize);
  const lotSizeUnit = formData.lotSizeUnit.trim();
  if ((lotSize !== undefined) !== Boolean(lotSizeUnit)) {
    throw new Error("Lot size and lot size unit must be provided together.");
  }

  const yearBuilt = parseOptionalInt(formData.yearBuilt);
  const structuralRemodelYear = parseOptionalInt(formData.structuralRemodelYear);
  if (
    yearBuilt !== undefined &&
    structuralRemodelYear !== undefined &&
    structuralRemodelYear < yearBuilt
  ) {
    throw new Error(
      "Structural remodel year must be the same as or after year built."
    );
  }

  const beds = parseRequiredNonNegativeInt(formData.beds, "Beds");

  const openHouses = formData.openHouseDates
    .filter((o) => o.date && o.startTime && o.endTime)
    .map((o) => ({
      date: o.date,
      startTime: o.startTime,
      endTime: o.endTime,
    }));

  for (const oh of openHouses) {
    if (oh.endTime <= oh.startTime) {
      throw new Error("Each open house end time must be after start time.");
    }
  }

  const uploadIds = formData.photos.map((p) => p.id);
  if (uploadIds.length === 0) {
    throw new Error("At least one photo is required.");
  }

  const architecturalStyleRaw = formData.architectureType.trim();
  const architecturalStyle = architecturalStyleRaw
    ? mapWithTable(architecturalStyleRaw, ARCHITECTURAL_STYLE)
    : null;

  const homeFacts: Record<string, unknown> = {
    homeType: mapHomeType(formData.homeType.trim()),
    hoaDues: parseOptionalFloat(formData.hoaDues),
    beds,
    fullBaths: parseOptionalInt(formData.fullBaths) ?? 0,
    threeQuarterBaths: parseOptionalInt(formData.threeFourthBaths) ?? 0,
    halfBaths: parseOptionalInt(formData.halfBaths) ?? 0,
    quarterBaths: parseOptionalInt(formData.quarterBaths) ?? 0,
    basementSqFt: parseOptionalInt(formData.squareFootage),
    garageSqFt: parseOptionalInt(formData.garageSqFt),
    finishedSquareFeet: parseOptionalInt(formData.finishedSqFt),
    lotSize,
    lotSizeUnit: lotSizeUnit || undefined,
    yearBuilt,
    structuralRemodelYear,
    homeDescription,
  };

  const basementFiltered = filterToAllowlist(
    formData.basement.trim() ? [formData.basement.trim()] : [],
    BASEMENT_OPTIONS
  );
  const roomDetails: Record<string, unknown> = {
    appliances: filterToAllowlist(formData.appliances, APPLIANCE_OPTIONS),
    basement: basementFiltered,
    floorCovering: filterToAllowlist(formData.flooring, FLOORING_OPTIONS),
    rooms: filterToAllowlist(formData.rooms, ROOM_OPTIONS),
    totalRooms: parseOptionalInt(formData.totalRooms),
    indoorFeatures: filterToAllowlist(formData.exteriorFeatures, INDOOR_FEATURES),
  };

  const utilityDetails: Record<string, unknown> = {
    coolingType: filterToAllowlist(formData.cooling, COOLING_OPTIONS),
    heatingType: filterToAllowlist(formData.heating, HEATING_OPTIONS),
    heatingFuel: mapArray(formData.waterHeater, HEATING_FUEL),
  };

  const styleRaw = formData.styleType.trim();
  const viewValue = styleRaw ? mapWithTable(styleRaw, VIEW) : "";
  const buildingDetails: Record<string, unknown> = {
    buildingAmenities: filterToAllowlist(
      formData.buildingAmenities,
      BUILDING_AMENITY_OPTIONS
    ),
    architecturalStyle,
    exterior: filterToAllowlist(
      formData.exteriorMaterial,
      EXTERIOR_MATERIAL_OPTIONS
    ),
    outdoorAmenities: filterToAllowlist(
      formData.outdoorAmenities,
      OUTDOOR_AMENITY_OPTIONS
    ),
    numberOfStories: parseOptionalInt(formData.stories),
    parking: filterToAllowlist(formData.parking, PARKING_OPTIONS),
    parkingSpaces: parseOptionalInt(formData.parkingSpaces),
    roof: filterToAllowlist(formData.roof, ROOF_OPTIONS),
    view: viewValue ? [viewValue] : [],
  };

  return {
    address: validated,
    pricing: {
      askingPrice: formData.price,
      currencyCode: "USD",
    },
    media: {
      uploadIds,
      virtualTourUrl: formData.virtualTourUrl.trim() || undefined,
    },
    homeFacts,
    openHouses,
    additionalInformation: {
      relatedWebsiteUrl: formData.realtorWebsite.trim() || undefined,
      whatILoveAboutThisHome: formData.additionalInfo.trim() || undefined,
    },
    roomDetails,
    utilityDetails,
    buildingDetails,
    contactInformation: {
      phoneNumber: formData.contactPhone.trim(),
    },
    consent: {
      listingTermsAccepted: formData.agreedToTerms,
    },
  };
}
