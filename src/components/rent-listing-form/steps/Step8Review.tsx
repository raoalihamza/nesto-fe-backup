"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  goToStep,
  goToSubStep,
  setCostsAndFees,
  restoreFromDraft,
} from "@/store/slices/listingFormSlice";
import { rentDraftService } from "@/lib/api/rentDraft.service";
import type { ListingContextData } from "@/store/slices/listingFormSlice";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminFeeModal } from "@/components/rent-listing-form/modals/AdminFeeModal";
import {
  ChevronDown,
  Users,
  ParkingSquare,
  Lightbulb,
  CircleDollarSign,
  MoreHorizontal,
  AlertCircle,
} from "lucide-react";
import type { DraftValidationIssue } from "@/store/slices/listingFormSlice";
import type { FeeCategory, PropertyFee } from "@/types/property";

// ── Helpers ────────────────────────────────────────────────

function buildAddress(ctx: ListingContextData): string | null {
  if (!ctx.city && !ctx.stateCode) return null;
  const parts = [ctx.addressLine1, ctx.city, ctx.stateCode, ctx.postalCode].filter(Boolean);
  return parts.join(", ") || null;
}

function formatCurrency(amount: number | null) {
  if (amount === null) return null;
  return `$${amount.toLocaleString("en-US")}`;
}

function joinLabels(items: string[], tFn: (key: string) => string): string | null {
  if (items.length === 0) return null;
  return items.map((i) => tFn(i)).join(", ");
}

const LISTED_BY_LABEL: Record<string, string> = {
  property_owner: "propertyOwner",
  management_company: "managementCompany",
  tenant: "tenant",
};

const FEE_CATEGORIES: {
  key: FeeCategory;
  icon: React.ReactNode;
  labelKey: string;
}[] = [
  { key: "administrative", icon: <Users className="h-4.5 w-4.5 text-muted-foreground" />, labelKey: "administrative" },
  { key: "parking", icon: <ParkingSquare className="h-4.5 w-4.5 text-muted-foreground" />, labelKey: "parking" },
  { key: "utilities", icon: <Lightbulb className="h-4.5 w-4.5 text-muted-foreground" />, labelKey: "utilities" },
  { key: "other", icon: <CircleDollarSign className="h-4.5 w-4.5 text-muted-foreground" />, labelKey: "otherCategories" },
];

const REQUIREMENT_LABEL: Record<string, string> = {
  required: "required",
  optional: "optional",
  situational: "situational",
};

const FREQUENCY_LABEL: Record<string, string> = {
  one_time: "paidOneTime",
  monthly: "paidMonthly",
  weekly: "paidWeekly",
  yearly: "paidYearly",
  per_lease: "paidPerLease",
  per_occurrence: "paidPerOccurrence",
  other: "other",
};

// ── Completion pie SVG ─────────────────────────────────────

function CompletionPie({ percent }: { percent: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="shrink-0">
      <circle cx="24" cy="24" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="5" />
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="none"
        stroke={percent >= 100 ? "#22c55e" : "#C02121"}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 24 24)"
      />
    </svg>
  );
}

// ── Accordion section ──────────────────────────────────────

function ReviewSection({
  title,
  defaultOpen = false,
  issues = [],
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  issues?: DraftValidationIssue[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasIssues = issues.length > 0;

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 cursor-pointer"
      >
        <span className="flex items-center gap-2 text-base font-semibold text-foreground">
          {title}
          {hasIssues && !open && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

// ── Field row ──────────────────────────────────────────────

function FieldRow({
  label,
  value,
  onEdit,
  editLabel,
  issue,
}: {
  label: string;
  value: React.ReactNode;
  onEdit?: () => void;
  editLabel: string;
  issue?: DraftValidationIssue;
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-border last:border-0">
      <div className="space-y-0.5">
        <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          {label}
          {issue && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
        </p>
        {issue ? (
          <p className="text-xs text-red-500">{issue.message}</p>
        ) : (
          <div className="text-sm text-muted-foreground">{value || "None"}</div>
        )}
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 text-sm font-medium text-foreground hover:underline cursor-pointer ml-4"
        >
          {editLabel}
        </button>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────

export function Step8Review() {
  const t = useTranslations("listing.review");
  const tProp = useTranslations("listing.propertyInfo");
  const tRent = useTranslations("listing.rentDetails");
  const tMedia = useTranslations("listing.media");
  const tAmen = useTranslations("listing.amenities");
  const tScreen = useTranslations("listing.screening");
  const tCosts = useTranslations("listing.costs");
  const tFinal = useTranslations("listing.finalDetails");
  const tCommon = useTranslations("common");

  const dispatch = useAppDispatch();
  const draftId = useAppSelector((s) => s.listingForm.draftId);
  const formData = useAppSelector((s) => s.listingForm.formData);
  const validationIssues = useAppSelector((s) => s.listingForm.draftProgress?.validationIssues ?? []);

  // Group issues by section for ReviewSection icons
  const issuesBySection = useMemo(() => {
    const map: Record<string, DraftValidationIssue[]> = {};
    for (const issue of validationIssues) {
      if (!map[issue.section]) map[issue.section] = [];
      map[issue.section].push(issue);
    }
    return map;
  }, [validationIssues]);

  // Find a specific field issue
  function findIssue(section: string, field: string) {
    return validationIssues.find((i) => i.section === section && i.field === field);
  }

  useEffect(() => {
    if (!draftId) return;
    rentDraftService
      .getReview(draftId)
      .then((response) => dispatch(restoreFromDraft(response)))
      .catch(() => {
        // Review fetch failed silently — display existing Redux data
      });
  }, [draftId, dispatch]);
  const { listingContext, propertyInfo, rentDetails, media, amenities, screeningCriteria, costsAndFees, finalDetails } =
    formData;

  const [showTotalMonthlyPrice, setShowTotalMonthlyPrice] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<FeeCategory>("administrative");
  const [editingFee, setEditingFee] = useState<PropertyFee | null>(null);

  // Compute required completion
  const completionInfo = useMemo(() => {
    const checks = [
      { key: "totalBedrooms", ok: propertyInfo.totalBedrooms !== null },
      { key: "totalBathrooms", ok: propertyInfo.totalBathrooms !== null },
      { key: "monthlyRent", ok: rentDetails.monthlyRent !== null },
      { key: "photos", ok: media.photos.length > 0 },
      { key: "leaseDuration", ok: finalDetails.leaseDuration !== null },
      { key: "name", ok: finalDetails.name !== null },
      { key: "email", ok: finalDetails.email !== null },
    ];
    const complete = checks.filter((c) => c.ok).length;
    const total = checks.length;
    const missing = checks.filter((c) => !c.ok);
    return {
      requiredComplete: missing.length === 0,
      missingCount: missing.length,
      percent: Math.round((complete / total) * 100),
    };
  }, [propertyInfo, rentDetails, media, finalDetails]);

  // Navigation helpers
  function editStep(step: number, subStep?: number) {
    dispatch(goToStep(step));
    if (subStep !== undefined) {
      dispatch(goToSubStep(subStep));
    }
  }

  // Fee handlers
  function handleAddFee(category: FeeCategory) {
    setModalCategory(category);
    setEditingFee(null);
    setModalOpen(true);
  }

  function handleEditFee(fee: PropertyFee) {
    setModalCategory(fee.category);
    setEditingFee(fee);
    setModalOpen(true);
  }

  function handleDeleteFee(feeId: string) {
    dispatch(
      setCostsAndFees({
        fees: costsAndFees.fees.filter((f) => f.feeId !== feeId),
      })
    );
  }

  function handleSaveFee(
    fee: Omit<PropertyFee, "feeId"> & { feeId?: string }
  ) {
    if (editingFee && fee.feeId) {
      dispatch(
        setCostsAndFees({
          fees: costsAndFees.fees.map((f) =>
            f.feeId === fee.feeId ? (fee as PropertyFee) : f
          ),
        })
      );
    } else {
      dispatch(
        setCostsAndFees({
          fees: [...costsAndFees.fees, fee as PropertyFee],
        })
      );
    }
    setModalOpen(false);
    setEditingFee(null);
  }

  function getFeesForCategory(category: FeeCategory) {
    return costsAndFees.fees.filter((f) => f.category === category);
  }

  // Build display values
  const address = buildAddress(listingContext);
  const specialOffer = rentDetails.specialOffer?.description ?? null;

  // Amenities display
  const interiorParts: string[] = [];
  if (amenities.laundry.length > 0)
    interiorParts.push(amenities.laundry.map((l) => tAmen(`laundryOptions.${l}`)).join(", "));
  if (amenities.cooling.length > 0)
    interiorParts.push(
      `${tAmen("cooling")}: ${amenities.cooling.map((c) => tAmen(`coolingOptions.${c}`)).join(", ")}`
    );
  if (amenities.heating.length > 0)
    interiorParts.push(
      `${tAmen("heating")}: ${amenities.heating.map((h) => tAmen(`heatingOptions.${h}`)).join(", ")}`
    );
  if (amenities.appliances.length > 0)
    interiorParts.push(
      `${tAmen("appliances")}: ${amenities.appliances.map((a) => tAmen(`applianceOptions.${a}`)).join(", ")}`
    );
  if (amenities.flooring.length > 0)
    interiorParts.push(
      `${tAmen("flooring")}: ${amenities.flooring.map((f) => tAmen(`flooringOptions.${f}`)).join(", ")}`
    );
  if (amenities.otherAmenities.length > 0)
    interiorParts.push(
      `${tAmen("otherAmenities")}: ${amenities.otherAmenities.map((o) => tAmen(`otherOptions.${o}`)).join(", ")}`
    );
  const interiorDisplay = interiorParts.length > 0 ? interiorParts.join("\n") : null;

  const propertyAmenParts: string[] = [];
  if (amenities.parking.length > 0)
    propertyAmenParts.push(joinLabels(amenities.parking, (k) => tAmen(`parkingOptions.${k}`))!);
  if (amenities.outdoorAmenities.length > 0)
    propertyAmenParts.push(joinLabels(amenities.outdoorAmenities, (k) => tAmen(`outdoorOptions.${k}`))!);
  if (amenities.accessibility.length > 0)
    propertyAmenParts.push(
      joinLabels(amenities.accessibility, (k) => tAmen(`accessibilityOptions.${k}`))!
    );
  const propertyAmenDisplay = propertyAmenParts.length > 0 ? propertyAmenParts.join(", ") : null;

  // Screening display
  const financialParts: string[] = [];
  financialParts.push(
    `${tScreen("minIncomeToRentRatio")}: ${screeningCriteria.minimumIncomeToRentRatio || tScreen("notSet")}`
  );
  financialParts.push(
    `${tScreen("minCreditScore")}: ${screeningCriteria.minimumCreditScore !== null ? screeningCriteria.minimumCreditScore : tScreen("notSet")}`
  );
  const financialDisplay = financialParts.join("\n");

  const petDisplay =
    screeningCriteria.arePetsAllowed === null
      ? tScreen("notSet")
      : screeningCriteria.arePetsAllowed
        ? t("petsAllowed")
        : t("noPets");

  // Final details
  const listedByDisplay = finalDetails.listedBy
    ? tFinal(LISTED_BY_LABEL[finalDetails.listedBy])
    : "None";

  const tourBookingDisplay = finalDetails.bookingToursInstantly
    ? tFinal("bookToursInstantly")
    : tScreen("notSet");

  const editLabel = tCommon("edit");
  const addLabel = tCommon("add");
  const tourUrl = media.tours3d[0]?.publicUrl ?? null;

  return (
    <div className="w-full max-w-lg">
      {/* Incomplete / complete banner */}
      <div className="rounded-xl border border-border p-4 flex items-center gap-4 mb-6">
        <CompletionPie percent={completionInfo.percent} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">
            {completionInfo.requiredComplete ? t("listingComplete") : t("listingIncomplete")}
          </p>
          <p className="text-sm text-muted-foreground">
            {completionInfo.requiredComplete
              ? t("readyToPublish")
              : t("completeToPublish", { count: completionInfo.missingCount })}{" "}
            {!completionInfo.requiredComplete && (
              <button type="button" className="text-brand font-medium hover:underline">
                {tCommon("learnMore")}
              </button>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {}}
          className="shrink-0 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          {t("previewListing")}
        </button>
      </div>

      {/* Section 1 — Property Information */}
      <ReviewSection title={t("propertyInformation")} issues={[...(issuesBySection["propertyInfo"] ?? []), ...(findIssue("finalDetails", "propertyDescription") ? [findIssue("finalDetails", "propertyDescription")!] : [])]}>
        <FieldRow
          label={t("address")}
          value={address}
          onEdit={() => editStep(6, 5)}
          editLabel={editLabel}
          issue={findIssue("propertyInfo", "address")}
        />
        <FieldRow
          label={t("hidePropertyAddress")}
          value={finalDetails.hidePropertyAddress ? tFinal("yes") : tFinal("no")}
          onEdit={() => editStep(6, 5)}
          editLabel={editLabel}
        />
        <FieldRow
          label={tProp("squareFootage")}
          value={
            propertyInfo.squareFootage
              ? `${propertyInfo.squareFootage.toLocaleString("en-US")} ${tProp("sqFt")}`
              : null
          }
          onEdit={() => editStep(0)}
          editLabel={editLabel}
          issue={findIssue("propertyInfo", "squareFootage")}
        />
        <FieldRow
          label={tProp("bedrooms")}
          value={propertyInfo.totalBedrooms}
          onEdit={() => editStep(0)}
          editLabel={editLabel}
          issue={findIssue("propertyInfo", "totalBedrooms")}
        />
        <FieldRow
          label={tProp("bathrooms")}
          value={propertyInfo.totalBathrooms}
          onEdit={() => editStep(0)}
          editLabel={editLabel}
          issue={findIssue("propertyInfo", "totalBathrooms")}
        />
        <FieldRow
          label={t("propertyType")}
          value={t("house")}
          onEdit={() => editStep(0)}
          editLabel={editLabel}
          issue={findIssue("propertyInfo", "propertyType")}
        />
        <FieldRow
          label={t("propertyDescription")}
          value={finalDetails.propertyDescription}
          onEdit={() => editStep(6, 4)}
          editLabel={editLabel}
          issue={findIssue("finalDetails", "propertyDescription")}
        />
      </ReviewSection>

      {/* Section 2 — Rent details */}
      <ReviewSection title={tRent("title")} issues={issuesBySection["rentDetails"]}>
        <FieldRow
          label={tRent("monthlyRent")}
          value={
            rentDetails.monthlyRent !== null
              ? `${formatCurrency(rentDetails.monthlyRent)}${tRent("perMonth")}`
              : null
          }
          onEdit={() => editStep(1)}
          editLabel={editLabel}
          issue={findIssue("rentDetails", "monthlyRent")}
        />
        <FieldRow
          label={t("specialOffer")}
          value={specialOffer}
          onEdit={() => editStep(1)}
          editLabel={editLabel}
        />
        <FieldRow
          label={tRent("securityDeposit")}
          value={formatCurrency(rentDetails.securityDeposit)}
          onEdit={() => editStep(1)}
          editLabel={editLabel}
          issue={findIssue("rentDetails", "securityDeposit")}
        />
      </ReviewSection>

      {/* Section 3 — Media */}
      <ReviewSection title={tMedia("title")} issues={issuesBySection["media"]}>
        {/* Photos */}
        <div className="py-3 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                {t("photos")}
                {findIssue("media", "photos") && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
              </p>
              {findIssue("media", "photos") ? (
                <p className="text-xs text-red-500">{findIssue("media", "photos")!.message}</p>
              ) : media.photos.length > 0 ? (
                <div className="flex gap-2">
                  {media.photos.slice(0, 3).map((photo) => (
                    <div
                      key={photo.mediaId}
                      className="relative h-14 w-14 overflow-hidden rounded-md border border-border"
                    >
                      <Image
                        src={photo.publicUrl}
                        alt={photo.mediaId}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {media.photos.length > 3 && (
                    <div className="flex h-14 w-14 items-center justify-center rounded-md border border-border text-xs text-muted-foreground">
                      +{media.photos.length - 3}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => editStep(2)}
              className="shrink-0 text-sm font-medium text-foreground hover:underline cursor-pointer ml-4"
            >
              {media.photos.length > 0 ? editLabel : addLabel}
            </button>
          </div>
        </div>
        {/* 3D Tour */}
        <FieldRow
          label={tMedia("tourHeading")}
          value={tourUrl}
          onEdit={() => editStep(2)}
          editLabel={tourUrl ? editLabel : tMedia("addTour")}
        />
      </ReviewSection>

      {/* Section 4 — Amenities */}
      <ReviewSection title={tAmen("title")} issues={issuesBySection["amenities"]}>
        <div className="py-3 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">{t("interiorAmenities")}</p>
              {interiorDisplay ? (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {interiorDisplay}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">None</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => editStep(3)}
              className="shrink-0 text-sm font-medium text-foreground hover:underline cursor-pointer ml-4"
            >
              {editLabel}
            </button>
          </div>
        </div>
        <FieldRow
          label={t("propertyAmenities")}
          value={propertyAmenDisplay}
          onEdit={() => editStep(3, 1)}
          editLabel={editLabel}
        />
        <FieldRow
          label={t("additionalAmenities")}
          value={
            amenities.otherAmenities.length > 0
              ? joinLabels(amenities.otherAmenities, (k) => tAmen(`otherOptions.${k}`))
              : null
          }
          onEdit={() => editStep(3)}
          editLabel={editLabel}
        />
      </ReviewSection>

      {/* Section 5 — Screening criteria */}
      <ReviewSection title={tScreen("title")} issues={issuesBySection["screeningCriteria"]}>
        <div className="py-3 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">{t("financialExpectations")}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {financialDisplay}
              </p>
            </div>
            <button
              type="button"
              onClick={() => editStep(4, 1)}
              className="shrink-0 text-sm font-medium text-foreground hover:underline cursor-pointer ml-4"
            >
              {editLabel}
            </button>
          </div>
        </div>
        <FieldRow
          label={t("pet")}
          value={petDisplay}
          onEdit={() => editStep(4)}
          editLabel={editLabel}
        />
      </ReviewSection>

      {/* Section 6 — Cost and fees (partially interactive) */}
      <ReviewSection title={t("costAndFees")} issues={issuesBySection["costsAndFees"]}>
        {/* Toggle card */}
        <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">
                {tCosts("showTotalMonthlyPrice")}
              </p>
              <p className="text-xs text-muted-foreground">{tCosts("turnOnIf")}</p>
              <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                <li>{tCosts("showTotalBullet1")}</li>
                <li>{tCosts("showTotalBullet2")}</li>
              </ul>
              <button
                type="button"
                className="text-xs font-semibold text-brand hover:underline"
              >
                {tCommon("learnMore")}
              </button>
            </div>
            <Switch
              checked={showTotalMonthlyPrice}
              onCheckedChange={setShowTotalMonthlyPrice}
            />
          </div>
        </div>

        {/* Fee categories */}
        <div className="divide-y divide-border">
          {FEE_CATEGORIES.map((cat) => {
            const fees = getFeesForCategory(cat.key);
            return (
              <div key={cat.key}>
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    {cat.icon}
                    <span className="text-sm font-medium text-foreground">
                      {tCosts(cat.labelKey)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddFee(cat.key)}
                    className="text-sm font-semibold text-foreground hover:text-brand underline cursor-pointer"
                  >
                    {tCosts("add")}
                  </button>
                </div>
                {fees.map((fee) => (
                  <div key={fee.feeId} className="border-t border-border py-3 pl-8">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground">{fee.feeName}</p>
                        {fee.description && (
                          <p className="text-xs text-muted-foreground">{fee.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            ${fee.feeAmount}
                          </span>{" "}
                          {tCosts("each")},{" "}
                          {tCosts(FREQUENCY_LABEL[fee.paymentFrequency])} |{" "}
                          {tCosts(REQUIREMENT_LABEL[fee.feeRequiredType])} |{" "}
                          {fee.refundability === "refundable" ? tCosts("refundable") : tCosts("nonRefundable")}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-accent cursor-pointer">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditFee(fee)}>
                            {tCommon("edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteFee(fee.feeId)}>
                            {tCommon("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </ReviewSection>

      {/* Section 7 — Final details */}
      <ReviewSection title={tFinal("title")} issues={issuesBySection["finalDetails"]}>
        <FieldRow
          label={tFinal("dateAvailable")}
          value={finalDetails.dateAvailable}
          onEdit={() => editStep(6, 0)}
          editLabel={editLabel}
          issue={findIssue("finalDetails", "dateAvailable")}
        />
        <FieldRow
          label={tFinal("leaseTermsLabel")}
          value={finalDetails.leaseTerms}
          onEdit={() => editStep(6, 0)}
          editLabel={editLabel}
          issue={findIssue("finalDetails", "leaseTerms")}
        />
        <FieldRow
          label={t("renterInsurance")}
          value={finalDetails.requiresRentersInsurance === true ? tFinal("yes") : tFinal("no")}
          onEdit={() => editStep(6, 0)}
          editLabel={editLabel}
        />
        <FieldRow
          label={tFinal("leaseDuration")}
          value={finalDetails.leaseDuration}
          onEdit={() => editStep(6, 0)}
          editLabel={editLabel}
          issue={findIssue("finalDetails", "leaseDuration")}
        />
        <FieldRow
          label={tFinal("listedByLabel")}
          value={listedByDisplay}
          onEdit={() => editStep(6, 1)}
          editLabel={editLabel}
          issue={findIssue("finalDetails", "listedBy")}
        />
        <FieldRow
          label={tFinal("nameLabel")}
          value={finalDetails.name}
          onEdit={() => editStep(6, 1)}
          editLabel={editLabel}
          issue={findIssue("finalDetails", "name")}
        />
        <FieldRow
          label={tFinal("emailLabel")}
          value={finalDetails.email}
          onEdit={() => editStep(6, 1)}
          editLabel={editLabel}
          issue={findIssue("finalDetails", "email")}
        />
        <FieldRow
          label={tFinal("phoneNumberLabel")}
          value={finalDetails.phoneNumber}
          onEdit={() => editStep(6, 2)}
          editLabel={editLabel}
          issue={findIssue("finalDetails", "phoneNumber")}
        />
        <FieldRow
          label={tFinal("allowPhoneContact")}
          value={finalDetails.allowRentersToContactByPhone ? tFinal("yes") : tFinal("no")}
          onEdit={() => editStep(6, 2)}
          editLabel={editLabel}
        />
        <FieldRow
          label={t("tourBookingMethod")}
          value={tourBookingDisplay}
          onEdit={() => editStep(6, 3)}
          editLabel={editLabel}
        />
        <FieldRow
          label={tFinal("acceptOnlineApplications")}
          value={finalDetails.acceptOnlineApplications ? tFinal("yes") : tFinal("no")}
          onEdit={() => editStep(6, 5)}
          editLabel={editLabel}
        />
      </ReviewSection>

      <AdminFeeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        category={modalCategory}
        editingFee={editingFee}
        onSave={handleSaveFee}
      />
    </div>
  );
}
