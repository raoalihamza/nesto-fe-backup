import type {
  ListingFormData,
  FinalDetailsData,
  PropertyInfoData,
  RentDetailsData,
  ScreeningCriteriaData,
  CostsAndFeesData,
  PropertyFee,
} from "@/store/slices/listingFormSlice";
import type {
  RentListingUpdateBody,
  RentEditAddressPayload,
  RentEditListingEntryPayload,
  RentEditPropertyInfoBody,
  RentEditRentDetailsBody,
  RentEditFinalDetailsBody,
  RentEditScreeningCriteriaBody,
  RentEditCostsAndFeesBody,
  RentEditFeeBody,
  RentEditSpecialOfferBody,
} from "@/lib/api/rentListingEdit.service";

/**
 * Full-body builder for PUT /listings/rent/:listingId.
 *
 * Policy (mirrors decisions in RENT_LISTING_EDIT_FRONTEND_GUIDE.md):
 * - Required-field validation is backend-driven: frontend serializes the user's
 *   current Redux state as-is and surfaces `RENT_LISTING_EDIT_VALIDATION_FAILED`
 *   / `REQUEST_VALIDATION_FAILED` via toast (same pattern as the draft flow).
 *   No silent fallback to prior server values.
 * - Cleared optional fields serialize to `null` (or empty arrays) per contract.
 * - `finalDetails.phoneNumber` / `phoneVerified` are never sent here — phone
 *   updates flow through POST /verify-phone.
 * - `media.photos` is read-only here; only `media.tours3d` is part of PUT.
 * - `costsAndFees.fees` is a full replace, always send the complete list.
 */

function trimOrNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function numberOrNull(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseNumericStringOrNull(
  raw: string | number | null | undefined
): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (raw == null) return null;
  const cleaned = String(raw).trim();
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseRatioOrNull(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const cleaned = String(raw).replace("x", "").trim();
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function buildAddress(
  current: PropertyInfoData["address"]
): RentEditAddressPayload {
  // Address is readonly in edit mode, so the Redux copy is the GET /edit value.
  // Missing fields are forwarded to the server, which will reject the request
  // with a structured validation error if anything required is absent.
  return {
    placeId: current.placeId ?? "",
    formattedAddress: current.formattedAddress ?? "",
    addressLine1: current.addressLine1 ?? null,
    addressLine2: current.addressLine2 ?? null,
    city: current.city ?? null,
    stateCode: current.stateCode ?? null,
    postalCode: current.postalCode ?? null,
    countryCode: current.countryCode ?? "US",
    latitude: typeof current.latitude === "number" ? current.latitude : 0,
    longitude: typeof current.longitude === "number" ? current.longitude : 0,
  };
}

function buildListingEntry(
  current: PropertyInfoData["listingEntry"]
): RentEditListingEntryPayload {
  return {
    propertyType: current.propertyType ?? "",
    unitNumber: trimOrNull(current.unitNumber),
    numberOfUnits: numberOrNull(current.numberOfUnits),
    isSharedLivingSpace: Boolean(current.isSharedLivingSpace),
  };
}

function buildPropertyInfo(
  current: PropertyInfoData
): RentEditPropertyInfoBody {
  return {
    address: buildAddress(current.address),
    listingEntry: buildListingEntry(current.listingEntry),
    squareFootage: numberOrNull(current.squareFootage),
    totalBedrooms: parseNumericStringOrNull(current.totalBedrooms),
    totalBathrooms: parseNumericStringOrNull(current.totalBathrooms),
    totalHalfBathrooms: parseNumericStringOrNull(current.totalHalfBathrooms),
  };
}

function buildSpecialOffer(
  current: RentDetailsData["specialOffer"]
): RentEditSpecialOfferBody | null {
  if (!current) return null;
  const start = trimOrNull(current.offerStartDate);
  const end = trimOrNull(current.offerEndDate);
  const description = trimOrNull(current.description);
  if (!start && !end && !description) return null;
  return {
    offerStartDate: start,
    offerEndDate: end,
    description,
  };
}

function buildRentDetails(
  current: RentDetailsData
): RentEditRentDetailsBody {
  return {
    // Backend may return numeric strings ("2500") in GET/edit payloads; parse
    // them so untouched values don't get downgraded to null/0 on PUT.
    monthlyRent: parseNumericStringOrNull(
      current.monthlyRent as number | string | null | undefined
    ),
    securityDeposit: parseNumericStringOrNull(
      current.securityDeposit as number | string | null | undefined
    ),
    specialOffer: buildSpecialOffer(current.specialOffer),
  };
}

function buildScreeningCriteria(
  current: ScreeningCriteriaData
): RentEditScreeningCriteriaBody {
  return {
    arePetsAllowed:
      typeof current.arePetsAllowed === "boolean"
        ? current.arePetsAllowed
        : null,
    petPolicyNegotiable:
      typeof current.petPolicyNegotiable === "boolean"
        ? current.petPolicyNegotiable
        : null,
    minimumIncomeToRentRatio: parseRatioOrNull(current.minimumIncomeToRentRatio),
    incomeToRentRatioNegotiable:
      typeof current.incomeToRentRatioNegotiable === "boolean"
        ? current.incomeToRentRatioNegotiable
        : null,
    minimumMonthlyPreTaxIncome: parseNumericStringOrNull(
      current.minimumMonthlyPreTaxIncome
    ),
    minimumCreditScore: numberOrNull(current.minimumCreditScore),
    creditScoreNegotiable:
      typeof current.creditScoreNegotiable === "boolean"
        ? current.creditScoreNegotiable
        : null,
  };
}

function buildFees(current: CostsAndFeesData): RentEditCostsAndFeesBody {
  const fees: RentEditFeeBody[] = (current.fees ?? []).map(
    (fee: PropertyFee, index: number) => {
      const description = trimOrNull(fee.description);
      const feeAmountParsed = parseNumericStringOrNull(
        fee.feeAmount as number | string | null | undefined
      );
      return {
        category: fee.category,
        feeName: fee.feeName,
        paymentFrequency: fee.paymentFrequency,
        feeFormat: fee.feeFormat,
        // Backend may send feeAmount as a numeric string ("500") in draft/edit
        // responses. Parse that value instead of coercing to 0.
        feeAmount: feeAmountParsed ?? 0,
        includedInRent: Boolean(fee.includedInRent),
        feeRequiredType: fee.feeRequiredType,
        refundability: fee.refundability,
        // Backend rejects null; send string when present, otherwise omit key.
        description: description ?? undefined,
        sortOrder: typeof fee.sortOrder === "number" ? fee.sortOrder : index,
      };
    }
  );
  return { fees };
}

function buildFinalDetails(
  current: FinalDetailsData
): RentEditFinalDetailsBody {
  return {
    leaseTerms: trimOrNull(current.leaseTerms),
    requiresRentersInsurance:
      typeof current.requiresRentersInsurance === "boolean"
        ? current.requiresRentersInsurance
        : null,
    listedBy: trimOrNull(current.listedBy),
    name: trimOrNull(current.name),
    email: trimOrNull(current.email),
    bookingToursInstantly:
      typeof current.bookingToursInstantly === "boolean"
        ? current.bookingToursInstantly
        : null,
    propertyDescription: trimOrNull(current.propertyDescription),
    hidePropertyAddress: Boolean(current.hidePropertyAddress),
    dateAvailable: trimOrNull(current.dateAvailable),
    leaseDuration: trimOrNull(current.leaseDuration),
    allowRentersToContactByPhone: Boolean(current.allowRentersToContactByPhone),
    acceptOnlineApplications: Boolean(current.acceptOnlineApplications),
  };
}

/**
 * Build the complete PUT body for published rent edit from current Redux state.
 * Backend owns required-field validation; the frontend simply surfaces any
 * returned validation errors via toast.
 */
export function buildRentEditUpdateBody(
  formData: ListingFormData
): RentListingUpdateBody {
  return {
    propertyInfo: buildPropertyInfo(formData.propertyInfo),
    rentDetails: buildRentDetails(formData.rentDetails),
    media: {
      tours3d: (formData.media?.tours3d ?? []).map((t, i) => ({
        tourName: t.tourName,
        tourUrl: t.tourUrl,
        sortOrder: typeof t.sortOrder === "number" ? t.sortOrder : i,
      })),
    },
    amenities: {
      laundry: formData.amenities.laundry ?? [],
      cooling: formData.amenities.cooling ?? [],
      heating: formData.amenities.heating ?? [],
      appliances: formData.amenities.appliances ?? [],
      flooring: formData.amenities.flooring ?? [],
      furnished: formData.amenities.furnished ?? [],
      parking: formData.amenities.parking ?? [],
      outdoorAmenities: formData.amenities.outdoorAmenities ?? [],
      accessibility: formData.amenities.accessibility ?? [],
      otherAmenities: formData.amenities.otherAmenities ?? [],
    },
    screeningCriteria: buildScreeningCriteria(formData.screeningCriteria),
    costsAndFees: buildFees(formData.costsAndFees),
    finalDetails: buildFinalDetails(formData.finalDetails),
  };
}
