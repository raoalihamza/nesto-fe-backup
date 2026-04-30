"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { setScreeningCriteria } from "@/store/slices/listingFormSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatReduxMoneyForInput } from "@/lib/rentListing/optionalMoneyField";

const INCOME_RATIO_OPTIONS = ["2x", "2.5x", "3x", "3.5x", "4x"];
const CREDIT_SCORE_OPTIONS = [
  { value: "580", label: "creditFair" },
  { value: "670", label: "creditGood" },
  { value: "740", label: "creditVeryGood" },
  { value: "800", label: "creditExceptional" },
];

function formatMonthlyRentLabel(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

/** Parse a stored ratio value (UI: "2.5x", legacy/API: number) into a number. */
function parseRatioValue(raw: string | number | null | undefined): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  const cleaned = String(raw).replace(/x/i, "").trim();
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function ScreeningStep2() {
  const t = useTranslations("listing.screening");
  const dispatch = useAppDispatch();
  const screeningCriteria = useAppSelector((s) => s.listingForm.formData.screeningCriteria);
  const monthlyRent = useAppSelector((s) => s.listingForm.formData.rentDetails.monthlyRent);
  const rentDisplay =
    monthlyRent !== null && Number.isFinite(monthlyRent) && monthlyRent > 0
      ? formatMonthlyRentLabel(monthlyRent)
      : null;

  const ratioNum = useMemo(
    () =>
      parseRatioValue(
        screeningCriteria.minimumIncomeToRentRatio as
          | string
          | number
          | null
          | undefined,
      ),
    [screeningCriteria.minimumIncomeToRentRatio],
  );

  // Derived from rent x ratio: this field is never user-editable here. It is
  // recomputed on every change to either input and persisted to Redux so it
  // flows to the backend on save.
  const derivedMinIncome = useMemo(() => {
    if (ratioNum === null) return null;
    if (
      monthlyRent === null ||
      !Number.isFinite(monthlyRent) ||
      monthlyRent <= 0
    ) {
      return null;
    }
    return Math.round(monthlyRent * ratioNum * 100) / 100;
  }, [ratioNum, monthlyRent]);

  useEffect(() => {
    const next =
      derivedMinIncome === null ? null : String(derivedMinIncome);
    if (screeningCriteria.minimumMonthlyPreTaxIncome !== next) {
      dispatch(
        setScreeningCriteria({ minimumMonthlyPreTaxIncome: next }),
      );
    }
  }, [
    derivedMinIncome,
    dispatch,
    screeningCriteria.minimumMonthlyPreTaxIncome,
  ]);

  const incomeNegotiable =
    screeningCriteria.incomeToRentRatioNegotiable === true;
  const ratioSelected =
    screeningCriteria.minimumIncomeToRentRatio !== null &&
    screeningCriteria.minimumIncomeToRentRatio !== undefined;
  const showSetRentHint = ratioSelected && monthlyRent === null;
  const minIncomeDisplay =
    derivedMinIncome !== null
      ? formatReduxMoneyForInput(derivedMinIncome)
      : "";

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("financialHeading")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {t("financialSubtitle")}
        </p>
      </div>

      {/* Minimum income-to-rent ratio */}
      <div className="space-y-2 max-w-md">
        <p
          className={cn(
            "text-sm font-semibold text-foreground",
            incomeNegotiable && "opacity-60",
          )}
        >
          {t("minIncomeToRentRatio")}
        </p>
        <Select
          disabled={incomeNegotiable}
          value={screeningCriteria.minimumIncomeToRentRatio || "not_set"}
          onValueChange={(value) =>
            dispatch(
              setScreeningCriteria({
                minimumIncomeToRentRatio: value === "not_set" ? null : value,
              }),
            )
          }
        >
          <SelectTrigger
            disabled={incomeNegotiable}
            className="h-12! w-full text-base sm:w-80"
          >
            <SelectValue placeholder={t("notSet")}>
              {(value: string) =>
                value === "not_set" ? t("notSet") : value || null
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_set">{t("notSet")}</SelectItem>
            {INCOME_RATIO_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {rentDisplay !== null ? (
          <p className="text-xs text-muted-foreground">{t("rentSetAt", { amount: rentDisplay })}</p>
        ) : null}

        <div className="flex items-center gap-2">
          <Checkbox
            id="incomeNegotiable"
            checked={screeningCriteria.incomeToRentRatioNegotiable === true}
            onCheckedChange={(checked) =>
              dispatch(
                setScreeningCriteria({
                  incomeToRentRatioNegotiable: checked === true,
                }),
              )
            }
          />
          <Label
            htmlFor="incomeNegotiable"
            className="text-sm text-foreground cursor-pointer"
          >
            {t("incomeRatioNegotiable")}
          </Label>
        </div>
      </div>

      {/* Minimum monthly pre-tax income (derived from rent x ratio, readonly) */}
      <div className="space-y-2 max-w-md">
        <p
          className={cn(
            "text-sm font-semibold text-foreground",
            incomeNegotiable && "opacity-60",
          )}
        >
          {t("minMonthlyPreTaxIncome")}
        </p>
        <div className="relative w-full sm:w-80">
          <span
            className={cn(
              "pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-muted-foreground",
              incomeNegotiable && "opacity-60",
            )}
          >
            $
          </span>
          <Input
            type="text"
            readOnly
            tabIndex={-1}
            aria-readonly="true"
            disabled={incomeNegotiable}
            value={minIncomeDisplay}
            placeholder=""
            className="h-12! w-full cursor-default pl-8 text-base"
          />
        </div>
        {showSetRentHint ? (
          <p className="text-xs text-muted-foreground">
            {t("setRentFirstHelper")}
          </p>
        ) : null}
      </div>

      {/* Minimum credit score */}
      <div className="space-y-2 max-w-md">
        <p className="text-sm font-semibold text-foreground">
          {t("minCreditScore")}
        </p>
        <Select
          value={
            screeningCriteria.minimumCreditScore !== null
              ? String(screeningCriteria.minimumCreditScore)
              : "not_set"
          }
          onValueChange={(value) =>
            dispatch(
              setScreeningCriteria({
                minimumCreditScore: value === "not_set" ? null : Number(value),
              }),
            )
          }
        >
          <SelectTrigger className="h-12! w-full text-base sm:w-80">
            <SelectValue placeholder={t("notSet")}>
              {(value: string) => {
                if (!value || value === "not_set") return t("notSet");
                const match = CREDIT_SCORE_OPTIONS.find(
                  (o) => o.value === value,
                );
                return match ? t(match.label) : value;
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_set">{t("notSet")}</SelectItem>
            {CREDIT_SCORE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {t(opt.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Checkbox
            id="creditNegotiable"
            checked={screeningCriteria.creditScoreNegotiable === true}
            onCheckedChange={(checked) =>
              dispatch(
                setScreeningCriteria({
                  creditScoreNegotiable: checked === true,
                }),
              )
            }
          />
          <Label
            htmlFor="creditNegotiable"
            className="text-sm text-foreground cursor-pointer"
          >
            {t("creditScoreNegotiable")}
          </Label>
        </div>
      </div>
    </div>
  );
}
