"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { setRentDetails } from "@/store/slices/listingFormSlice";
import type { SpecialOfferData } from "@/store/slices/listingFormSlice";
import { format, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SpecialOfferModal } from "@/components/rent-listing-form/modals/SpecialOfferModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRentStepperUiOptional } from "@/components/rent-listing-form/RentStepperUiContext";
import {
  sanitizeOptionalMoneyInput,
  formatSanitizedMoneyForDisplay,
  validateOptionalMoneyField,
  formatUsdRangeLabel,
  formatReduxMoneyForInput,
  RENT_MONEY_MIN_AMOUNT,
  RENT_MONEY_MAX_AMOUNT,
  type OptionalMoneyFieldErrorCode,
} from "@/lib/rentListing/optionalMoneyField";

const MONEY_ERROR_MESSAGE_KEY: Record<OptionalMoneyFieldErrorCode, string> = {
  invalid_format: "invalidFormat",
  too_many_decimals: "tooManyDecimals",
  not_positive: "notPositive",
  out_of_range: "outOfRange",
};

function moneyFieldErrorMessage(
  t: (key: string, values?: Record<string, string>) => string,
  field: "monthlyRent" | "securityDeposit",
  code: OptionalMoneyFieldErrorCode | null
): string | null {
  if (!code) return null;
  const scope =
    field === "monthlyRent" ? "errors.monthlyRent" : "errors.securityDeposit";
  if (code === "out_of_range") {
    return t(`${scope}.outOfRange`, {
      min: formatUsdRangeLabel(RENT_MONEY_MIN_AMOUNT),
      max: formatUsdRangeLabel(RENT_MONEY_MAX_AMOUNT),
    });
  }
  return t(`${scope}.${MONEY_ERROR_MESSAGE_KEY[code]}`);
}

export function Step2RentDetails() {
  const t = useTranslations("listing.rentDetails");
  const tCommon = useTranslations("common");
  const dispatch = useAppDispatch();
  const data = useAppSelector((s) => s.listingForm.formData.rentDetails);
  const stepperUi = useRentStepperUiOptional();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOfferData | null>(
    null
  );

  const [monthlyRentText, setMonthlyRentText] = useState(() =>
    formatReduxMoneyForInput(data.monthlyRent)
  );
  const [securityDepositText, setSecurityDepositText] = useState(() =>
    formatReduxMoneyForInput(data.securityDeposit)
  );

  const rentResult = validateOptionalMoneyField(monthlyRentText);
  const depositResult = validateOptionalMoneyField(securityDepositText);

  useEffect(() => {
    const rent = validateOptionalMoneyField(monthlyRentText);
    const dep = validateOptionalMoneyField(securityDepositText);
    const blocked =
      (!rent.isEmpty && !rent.isValid) || (!dep.isEmpty && !dep.isValid);
    stepperUi?.setRentDetailsNextBlocked(blocked);
  }, [monthlyRentText, securityDepositText, stepperUi]);

  useEffect(() => {
    return () => stepperUi?.setRentDetailsNextBlocked(false);
  }, [stepperUi]);

  const monthlyRentError = moneyFieldErrorMessage(
    t,
    "monthlyRent",
    !rentResult.isEmpty && !rentResult.isValid ? rentResult.errorCode : null
  );
  const securityDepositError = moneyFieldErrorMessage(
    t,
    "securityDeposit",
    !depositResult.isEmpty && !depositResult.isValid
      ? depositResult.errorCode
      : null
  );

  const handleMoneyChange = useCallback(
    (
      raw: string,
      field: "monthlyRent" | "securityDeposit",
      setText: (s: string) => void
    ) => {
      const sanitized = sanitizeOptionalMoneyInput(raw);
      const display = formatSanitizedMoneyForDisplay(sanitized);
      setText(display);
      const result = validateOptionalMoneyField(display);
      if (result.isEmpty) {
        dispatch(
          setRentDetails(
            field === "monthlyRent"
              ? { monthlyRent: null }
              : { securityDeposit: null }
          )
        );
        return;
      }
      if (result.isValid && result.numericValue !== null) {
        dispatch(
          setRentDetails(
            field === "monthlyRent"
              ? { monthlyRent: result.numericValue }
              : { securityDeposit: result.numericValue }
          )
        );
        return;
      }
      dispatch(
        setRentDetails(
          field === "monthlyRent"
            ? { monthlyRent: null }
            : { securityDeposit: null }
        )
      );
    },
    [dispatch]
  );

  const rentDisplay =
    data.monthlyRent !== null &&
    Number.isFinite(data.monthlyRent) &&
    data.monthlyRent > 0
      ? `$${data.monthlyRent.toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}`
      : null;

  function handleAddOffer() {
    setEditingOffer(null);
    setModalOpen(true);
  }

  function handleEditOffer() {
    setEditingOffer(data.specialOffer);
    setModalOpen(true);
  }

  function handleDeleteOffer() {
    dispatch(setRentDetails({ specialOffer: null }));
  }

  function handleSaveOffer(offer: SpecialOfferData) {
    dispatch(setRentDetails({ specialOffer: offer }));
    setModalOpen(false);
    setEditingOffer(null);
  }

  const canSetDepositFromRent =
    data.monthlyRent !== null &&
    Number.isFinite(data.monthlyRent) &&
    data.monthlyRent > 0 &&
    rentResult.isValid &&
    !rentResult.isEmpty;

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {t("heading")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>

      {/* <p className="mt-3 text-sm text-foreground">
        {t("rentNestimate", { amount: "$1,495" })}
      </p> */}

      <div className="mt-8 space-y-6">
        {/* Monthly rent */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t("monthlyRent")}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-muted-foreground">
              $
            </span>
            <Input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              aria-invalid={Boolean(monthlyRentError)}
              value={monthlyRentText}
              onChange={(e) =>
                handleMoneyChange(
                  e.target.value,
                  "monthlyRent",
                  setMonthlyRentText
                )
              }
              className={cn(
                "h-12 pr-16 pl-8 text-base",
                monthlyRentError && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">
              {t("perMonth")}
            </span>
          </div>
          {monthlyRentError ? (
            <p className="mt-1.5 text-sm text-destructive">{monthlyRentError}</p>
          ) : null}
        </div>

        {/* Security deposit */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t("securityDeposit")}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-muted-foreground">
              $
            </span>
            <Input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              aria-invalid={Boolean(securityDepositError)}
              value={securityDepositText}
              onChange={(e) =>
                handleMoneyChange(
                  e.target.value,
                  "securityDeposit",
                  setSecurityDepositText
                )
              }
              className={cn(
                "h-12 pl-8 text-base",
                securityDepositError &&
                  "border-destructive focus-visible:ring-destructive"
              )}
            />
          </div>
          {securityDepositError ? (
            <p className="mt-1.5 text-sm text-destructive">
              {securityDepositError}
            </p>
          ) : null}
          <button
            type="button"
            disabled={!canSetDepositFromRent}
            onClick={() => {
              if (
                data.monthlyRent !== null &&
                Number.isFinite(data.monthlyRent)
              ) {
                dispatch(
                  setRentDetails({ securityDeposit: data.monthlyRent })
                );
                setSecurityDepositText(
                  formatReduxMoneyForInput(data.monthlyRent)
                );
              }
            }}
            className={cn(
              "mt-1.5 text-sm font-medium underline",
              canSetDepositFromRent
                ? "cursor-pointer text-brand"
                : "cursor-not-allowed text-muted-foreground no-underline"
            )}
          >
            {rentDisplay
              ? t("setDepositAsRent", { amount: rentDisplay })
              : t("setDepositUnavailable")}
          </button>
        </div>

        {/* Special offer section */}
        <div>
          <p className="text-sm font-medium text-foreground">
            {t("promoteOffer")}
          </p>

          {data.specialOffer ? (
            <div className="mt-3 rounded-lg border border-border p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  {(data.specialOffer.offerStartDate ||
                    data.specialOffer.offerEndDate) && (
                    <p className="text-sm font-medium text-foreground">
                      {data.specialOffer.offerStartDate &&
                        format(
                          parseISO(data.specialOffer.offerStartDate),
                          "MMM d, yyyy"
                        )}
                      {data.specialOffer.offerStartDate &&
                        data.specialOffer.offerEndDate &&
                        " — "}
                      {data.specialOffer.offerEndDate &&
                        format(
                          parseISO(data.specialOffer.offerEndDate),
                          "MMM d, yyyy"
                        )}
                    </p>
                  )}
                  {data.specialOffer.description && (
                    <p className="text-sm text-muted-foreground">
                      {data.specialOffer.description}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-accent">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEditOffer}>
                      {tCommon("edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeleteOffer}>
                      {tCommon("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleAddOffer}
              className="mt-3 h-10 cursor-pointer rounded-lg px-4 text-sm font-medium"
            >
              {t("addOffer")}
            </Button>
          )}
        </div>
      </div>

      <SpecialOfferModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editingOffer={editingOffer}
        onSave={handleSaveOffer}
      />
    </div>
  );
}
