import { z } from "zod";
import type { SaleFormData } from "@/lib/saleListing/saleListingFormTypes";
import {
  ARCHITECTURE_TYPE_OPTIONS,
  HOME_TYPES,
  LOT_SIZE_UNITS,
  SALE_LISTING_ADDITIONAL_INFO_MAX_CHARS,
  SALE_LISTING_DESCRIPTION_MAX_CHARS,
  STYLE_TYPE_OPTIONS,
} from "@/lib/saleListing/saleListingFormConstants";
import {
  validateRequiredMoneyField,
  type RequiredMoneyFieldErrorCode,
} from "@/lib/rentListing/optionalMoneyField";

const ALLOWED_LOT_SIZE_UNITS = new Set<string>(LOT_SIZE_UNITS);
const ALLOWED_HOME_TYPES = new Set<string>(HOME_TYPES as readonly string[]);
const ALLOWED_STYLE_TYPES = new Set<string>(STYLE_TYPE_OPTIONS as readonly string[]);
const ALLOWED_ARCHITECTURE_TYPES = new Set<string>(
  ARCHITECTURE_TYPE_OPTIONS as readonly string[]
);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const WHOLE_NON_NEG_RE = /^\d+$/;

const YEAR_MIN = 1800;
const YEAR_MAX = 3000;
const BATHROOM_COMBINED_MAX = 999.9;
const PHONE_LEN_MIN = 5;
const PHONE_LEN_MAX = 32;

const openHouseRowSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

function parseOptionalIntLocal(value: string): number | undefined {
  const t = value.trim();
  if (!t) return undefined;
  const n = Number.parseInt(t, 10);
  return Number.isFinite(n) ? n : undefined;
}

function createOptionalUrlOrEmpty(invalidMsg: string) {
  return z.string().refine(
    (s) => {
      const t = s.trim();
      if (!t) return true;
      try {
        // eslint-disable-next-line no-new -- URL validates shape
        new URL(t.startsWith("http") ? t : `https://${t}`);
        return true;
      } catch {
        return false;
      }
    },
    { message: invalidMsg }
  );
}

export type SaleListingPriceErrorMessages = Record<
  RequiredMoneyFieldErrorCode,
  string
>;

/** Localized strings for non-price sale form validation. */
export type SaleListingValidationMessages = {
  atLeastOnePhoto: string;
  acceptTerms: string;
  phoneRequired: string;
  phoneLength: string;
  invalidUrl: string;
  openHouseMaxRows: string;
  homeTypeRequired: string;
  homeTypeInvalid: string;
  descriptionRequired: string;
  descriptionMax: string;
  invalidHoaDues: string;
  bedsRequired: string;
  bedsWholeNonNegative: string;
  basementSqFtInvalid: string;
  garageSqFtInvalid: string;
  bathCountWholeNonNegative: string;
  bathroomTotalExceeded: string;
  finishedSqFtInvalid: string;
  lotSizeAndUnitTogether: string;
  lotSizeInvalid: string;
  lotSizeUnitInvalid: string;
  lotSizeNonNegative: string;
  yearOutOfRange: string;
  remodelYearOutOfRange: string;
  remodelAfterYearBuilt: string;
  openHouseIncomplete: string;
  openHouseDateFormat: string;
  openHouseTimeFormat: string;
  openHouseEndAfterStart: string;
  noneExclusive: string;
  duplicateSelections: string;
  architectureTypeInvalid: string;
  styleTypeInvalid: string;
  totalRoomsInvalid: string;
  storiesInvalid: string;
  parkingSpacesInvalid: string;
  additionalInfoMax: string;
};

export type SaleListingFormSchemaParams = {
  price: SaleListingPriceErrorMessages;
  validation: SaleListingValidationMessages;
  /** When true, `agreedToTerms` is not required (already accepted at publish). */
  isEditMode: boolean;
};

function priceIssueMessage(
  code: RequiredMoneyFieldErrorCode,
  msgs: SaleListingPriceErrorMessages
): string {
  return msgs[code];
}

function hasUniqueEntries(arr: string[]): boolean {
  const seen = new Set<string>();
  for (const raw of arr) {
    const v = raw.trim();
    if (!v) continue;
    if (seen.has(v)) return false;
    seen.add(v);
  }
  return true;
}

function optionalWholeNonNegativeInt(
  value: string,
  path: keyof SaleFormData,
  ctx: z.RefinementCtx,
  invalidMsg: string
): number | undefined {
  const t = value.trim();
  if (!t) return undefined;
  if (!WHOLE_NON_NEG_RE.test(t)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: invalidMsg,
      path: [path],
    });
    return undefined;
  }
  return Number.parseInt(t, 10);
}

function optionalNonNegativeFloat(
  value: string,
  path: keyof SaleFormData,
  ctx: z.RefinementCtx,
  invalidMsg: string
): number | undefined {
  const t = value.trim();
  if (!t) return undefined;
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n) || n < 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: invalidMsg,
      path: [path],
    });
    return undefined;
  }
  return n;
}

function optionalYearInRange(
  value: string,
  path: keyof SaleFormData,
  ctx: z.RefinementCtx,
  invalidRangeMsg: string
): number | undefined {
  const t = value.trim();
  if (!t) return undefined;
  if (!WHOLE_NON_NEG_RE.test(t)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: invalidRangeMsg,
      path: [path],
    });
    return undefined;
  }
  const y = Number.parseInt(t, 10);
  if (y < YEAR_MIN || y > YEAR_MAX) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: invalidRangeMsg,
      path: [path],
    });
    return undefined;
  }
  return y;
}

/**
 * Sale listing form validation aligned with `SALE_LISTING_FRONTEND_VALIDATION_GUIDE.md`
 * (pricing rules are passed separately via `price` and remain unchanged here).
 */
export function createSaleListingFormSchema(params: SaleListingFormSchemaParams) {
  const { price: priceErrorMessages, validation: v, isEditMode } = params;
  const optionalUrlOrEmpty = createOptionalUrlOrEmpty(v.invalidUrl);

  return z
    .object({
      price: z.string().superRefine((val, ctx) => {
        const r = validateRequiredMoneyField(val);
        if (r.isValid) return;
        const code = r.errorCode ?? "invalid_format";
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: priceIssueMessage(code, priceErrorMessages),
        });
      }),
      photos: z
        .array(
          z.object({
            id: z.string(),
            url: z.string(),
            fileName: z.string(),
            fileSizeBytes: z.number().optional(),
          })
        )
        .min(1, { message: v.atLeastOnePhoto }),
      virtualTourUrl: optionalUrlOrEmpty,
      tourUrl3D: z.string(),
      homeType: z.string().min(1, { message: v.homeTypeRequired }),
      hoaDues: z.string(),
      beds: z
        .string()
        .trim()
        .min(1, { message: v.bedsRequired })
        .refine((s) => WHOLE_NON_NEG_RE.test(s), {
          message: v.bedsWholeNonNegative,
        }),
      squareFootage: z.string(),
      garageSqFt: z.string(),
      fullBaths: z.string(),
      threeFourthBaths: z.string(),
      halfBaths: z.string(),
      quarterBaths: z.string(),
      description: z
        .string()
        .trim()
        .min(1, { message: v.descriptionRequired })
        .max(SALE_LISTING_DESCRIPTION_MAX_CHARS, { message: v.descriptionMax }),
      finishedSqFt: z.string(),
      lotSize: z.string(),
      lotSizeUnit: z.string(),
      yearBuilt: z.string(),
      structuralRemodelYear: z.string(),
      openHouseDates: z.array(openHouseRowSchema).max(50, {
        message: v.openHouseMaxRows,
      }),
      realtorWebsite: optionalUrlOrEmpty,
      additionalInfo: z
        .string()
        .max(SALE_LISTING_ADDITIONAL_INFO_MAX_CHARS, {
          message: v.additionalInfoMax,
        }),
      rooms: z.array(z.string()),
      totalRooms: z.string(),
      basement: z.string(),
      appliances: z.array(z.string()),
      flooring: z.array(z.string()),
      heating: z.array(z.string()),
      cooling: z.array(z.string()),
      electric: z.array(z.string()),
      water: z.array(z.string()),
      waterHeater: z.array(z.string()),
      conditionType: z.string(),
      architectureStyle: z.string(),
      construction: z.array(z.string()),
      exteriorFeatures: z.array(z.string()),
      buildingAmenities: z.array(z.string()),
      architectureType: z.string(),
      styleType: z.string(),
      exteriorMaterial: z.array(z.string()),
      outdoorAmenities: z.array(z.string()),
      stories: z.string(),
      parking: z.array(z.string()),
      parkingSpaces: z.string(),
      roof: z.array(z.string()),
      contactPhone: z.string().trim().min(1, { message: v.phoneRequired }),
      agreedToTerms: z.boolean(),
    })
    .superRefine((data, ctx) => {
      if (!isEditMode && data.agreedToTerms !== true) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: v.acceptTerms,
          path: ["agreedToTerms"],
        });
      }

      const phone = data.contactPhone.trim();
      if (phone.length < PHONE_LEN_MIN || phone.length > PHONE_LEN_MAX) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: v.phoneLength,
          path: ["contactPhone"],
        });
      }

      const ht = data.homeType.trim();
      if (!ALLOWED_HOME_TYPES.has(ht)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: v.homeTypeInvalid,
          path: ["homeType"],
        });
      }

      optionalNonNegativeFloat(data.hoaDues, "hoaDues", ctx, v.invalidHoaDues);

      optionalWholeNonNegativeInt(
        data.squareFootage,
        "squareFootage",
        ctx,
        v.basementSqFtInvalid
      );
      optionalWholeNonNegativeInt(
        data.garageSqFt,
        "garageSqFt",
        ctx,
        v.garageSqFtInvalid
      );

      const fb = optionalWholeNonNegativeInt(
        data.fullBaths,
        "fullBaths",
        ctx,
        v.bathCountWholeNonNegative
      );
      const tqb = optionalWholeNonNegativeInt(
        data.threeFourthBaths,
        "threeFourthBaths",
        ctx,
        v.bathCountWholeNonNegative
      );
      const hb = optionalWholeNonNegativeInt(
        data.halfBaths,
        "halfBaths",
        ctx,
        v.bathCountWholeNonNegative
      );
      const qb = optionalWholeNonNegativeInt(
        data.quarterBaths,
        "quarterBaths",
        ctx,
        v.bathCountWholeNonNegative
      );

      if (
        fb !== undefined &&
        tqb !== undefined &&
        hb !== undefined &&
        qb !== undefined
      ) {
        const combined =
          fb +
          tqb * 0.75 +
          hb * 0.5 +
          qb * 0.25;
        if (combined > BATHROOM_COMBINED_MAX) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: v.bathroomTotalExceeded,
            path: ["fullBaths"],
          });
        }
      }

      const finishedTrim = data.finishedSqFt.trim();
      if (finishedTrim) {
        if (!WHOLE_NON_NEG_RE.test(finishedTrim)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: v.finishedSqFtInvalid,
            path: ["finishedSqFt"],
          });
        } else {
          const n = Number.parseInt(finishedTrim, 10);
          if (n <= 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: v.finishedSqFtInvalid,
              path: ["finishedSqFt"],
            });
          }
        }
      }

      const lotSize = data.lotSize.trim();
      const lotUnit = data.lotSizeUnit.trim();
      const hasLot = Boolean(lotSize);
      const hasUnit = Boolean(lotUnit);
      if (hasLot !== hasUnit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: v.lotSizeAndUnitTogether,
          path: ["lotSize"],
        });
      }
      if (hasLot && lotSize) {
        const n = Number.parseFloat(lotSize);
        if (!Number.isFinite(n)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: v.lotSizeInvalid,
            path: ["lotSize"],
          });
        } else if (n < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: v.lotSizeNonNegative,
            path: ["lotSize"],
          });
        }
      }
      if (hasUnit && lotUnit && !ALLOWED_LOT_SIZE_UNITS.has(lotUnit)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: v.lotSizeUnitInvalid,
          path: ["lotSizeUnit"],
        });
      }

      const yb = optionalYearInRange(
        data.yearBuilt,
        "yearBuilt",
        ctx,
        v.yearOutOfRange
      );
      const sry = optionalYearInRange(
        data.structuralRemodelYear,
        "structuralRemodelYear",
        ctx,
        v.remodelYearOutOfRange
      );
      if (
        yb !== undefined &&
        sry !== undefined &&
        sry < yb
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: v.remodelAfterYearBuilt,
          path: ["structuralRemodelYear"],
        });
      }

      data.openHouseDates.forEach((row, index) => {
        const any = row.date.trim() || row.startTime.trim() || row.endTime.trim();
        if (!any) return;
        if (!row.date.trim() || !row.startTime.trim() || !row.endTime.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: v.openHouseIncomplete,
            path: ["openHouseDates", index, "date"],
          });
          return;
        }
        if (!DATE_RE.test(row.date)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: v.openHouseDateFormat,
            path: ["openHouseDates", index, "date"],
          });
        }
        if (!TIME_RE.test(row.startTime) || !TIME_RE.test(row.endTime)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: v.openHouseTimeFormat,
            path: ["openHouseDates", index, "startTime"],
          });
          return;
        }
        if (row.endTime <= row.startTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: v.openHouseEndAfterStart,
            path: ["openHouseDates", index, "endTime"],
          });
        }
      });

      const noneExclusive = (
        arr: string[],
        noneKey: string,
        path: keyof SaleFormData
      ) => {
        if (arr.includes(noneKey) && arr.length > 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: v.noneExclusive,
            path: [path],
          });
        }
      };
      noneExclusive(data.cooling, "none", "cooling");
      noneExclusive(data.waterHeater, "none_heater", "waterHeater");
      noneExclusive(data.water, "none_water", "water");
      noneExclusive(data.parking, "none", "parking");

      const styleTrim = data.styleType.trim();
      if (styleTrim && !ALLOWED_STYLE_TYPES.has(styleTrim)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: v.styleTypeInvalid,
          path: ["styleType"],
        });
      }

      const archTrim = data.architectureType.trim();
      if (archTrim && !ALLOWED_ARCHITECTURE_TYPES.has(archTrim)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: v.architectureTypeInvalid,
          path: ["architectureType"],
        });
      }

      optionalWholeNonNegativeInt(
        data.totalRooms,
        "totalRooms",
        ctx,
        v.totalRoomsInvalid
      );
      optionalWholeNonNegativeInt(
        data.stories,
        "stories",
        ctx,
        v.storiesInvalid
      );
      optionalWholeNonNegativeInt(
        data.parkingSpaces,
        "parkingSpaces",
        ctx,
        v.parkingSpacesInvalid
      );

      const dupGroups: Array<[string[], keyof SaleFormData]> = [
        [data.appliances, "appliances"],
        [data.flooring, "flooring"],
        [data.rooms, "rooms"],
        [data.exteriorFeatures, "exteriorFeatures"],
        [data.heating, "heating"],
        [data.cooling, "cooling"],
        [data.electric, "electric"],
        [data.water, "water"],
        [data.waterHeater, "waterHeater"],
        [data.buildingAmenities, "buildingAmenities"],
        [data.exteriorMaterial, "exteriorMaterial"],
        [data.outdoorAmenities, "outdoorAmenities"],
        [data.parking, "parking"],
        [data.roof, "roof"],
      ];
      for (const [arr, path] of dupGroups) {
        if (!hasUniqueEntries(arr)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: v.duplicateSelections,
            path: [path],
          });
        }
      }
    });
}
