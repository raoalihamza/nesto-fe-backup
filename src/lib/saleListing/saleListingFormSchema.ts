import { z } from "zod";
import type { SaleFormData } from "@/lib/saleListing/saleListingFormTypes";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

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

const optionalUrlOrEmpty = z
  .string()
  .refine(
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
    { message: "Enter a valid URL or leave empty." }
  );

/**
 * Strict validation aligned with SALE_LISTING_FRONTEND_GUIDE.md (sections 9–10).
 */
export const saleListingFormSchema = z
  .object({
    price: z
      .union([z.number(), z.null()])
      .refine(
        (v): v is number =>
          v != null && typeof v === "number" && Number.isFinite(v) && v > 0,
        { message: "Asking price must be a positive number." }
      ),
    photos: z
      .array(
        z.object({
          id: z.string(),
          url: z.string(),
          fileName: z.string(),
          fileSizeBytes: z.number().optional(),
        })
      )
      .min(1, { message: "At least one photo is required." }),
    virtualTourUrl: optionalUrlOrEmpty,
    tourUrl3D: z.string(),
    homeType: z.string().min(1, { message: "Home type is required." }),
    hoaDues: z.string(),
    beds: z
      .string()
      .trim()
      .min(1, { message: "Beds is required." })
      .refine((s) => {
        const n = Number.parseInt(s, 10);
        return Number.isFinite(n) && n >= 0;
      }, { message: "Beds must be a non-negative number." }),
    squareFootage: z.string(),
    garageSqFt: z.string(),
    fullBaths: z.string(),
    threeFourthBaths: z.string(),
    halfBaths: z.string(),
    quarterBaths: z.string(),
    description: z
      .string()
      .trim()
      .min(1, { message: "Home description is required." }),
    finishedSqFt: z.string(),
    lotSize: z.string(),
    lotSizeUnit: z.string(),
    yearBuilt: z.string(),
    structuralRemodelYear: z.string(),
    openHouseDates: z.array(openHouseRowSchema).max(50, {
      message: "Maximum 50 open house rows allowed.",
    }),
    realtorWebsite: optionalUrlOrEmpty,
    additionalInfo: z.string(),
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
    contactPhone: z
      .string()
      .trim()
      .min(1, { message: "Phone number is required." }),
    agreedToTerms: z
      .boolean()
      .refine((v) => v === true, {
        message: "You must accept the listing terms.",
      }),
  })
  .superRefine((data, ctx) => {
    const lotSize = data.lotSize.trim();
    const lotUnit = data.lotSizeUnit.trim();
    const hasLot = Boolean(lotSize);
    const hasUnit = Boolean(lotUnit);
    if (hasLot !== hasUnit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Lot size and lot size unit must be provided together.",
        path: ["lotSize"],
      });
    }
    if (hasLot && lotSize) {
      const n = Number.parseFloat(lotSize);
      if (!Number.isFinite(n)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Lot size must be a valid number.",
          path: ["lotSize"],
        });
      }
    }

    const yb = parseOptionalIntLocal(data.yearBuilt);
    const sry = parseOptionalIntLocal(data.structuralRemodelYear);
    if (
      yb !== undefined &&
      sry !== undefined &&
      sry < yb
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Structural remodel year must be the same as or after year built.",
        path: ["structuralRemodelYear"],
      });
    }

    data.openHouseDates.forEach((row, index) => {
      const any = row.date.trim() || row.startTime.trim() || row.endTime.trim();
      if (!any) return;
      if (!row.date.trim() || !row.startTime.trim() || !row.endTime.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Complete date, start time, and end time for each open house row.",
          path: ["openHouseDates", index, "date"],
        });
        return;
      }
      if (!DATE_RE.test(row.date)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date must be YYYY-MM-DD.",
          path: ["openHouseDates", index, "date"],
        });
      }
      if (!TIME_RE.test(row.startTime) || !TIME_RE.test(row.endTime)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Times must be HH:MM.",
          path: ["openHouseDates", index, "startTime"],
        });
        return;
      }
      if (row.endTime <= row.startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End time must be after start time.",
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
          message: `"None" cannot be combined with other selections.`,
          path: [path],
        });
      }
    };
    noneExclusive(data.cooling, "none", "cooling");
    noneExclusive(data.waterHeater, "none_heater", "waterHeater");
    noneExclusive(data.water, "none_water", "water");
    noneExclusive(data.parking, "none", "parking");
  });
