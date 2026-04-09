"use client";

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

const INCOME_RATIO_OPTIONS = ["2x", "2.5x", "3x", "3.5x", "4x"];
const CREDIT_SCORE_OPTIONS = [
  { value: "580", label: "creditFair" },
  { value: "670", label: "creditGood" },
  { value: "740", label: "creditVeryGood" },
  { value: "800", label: "creditExceptional" },
];

export function ScreeningStep2() {
  const t = useTranslations("listing.screening");
  const dispatch = useAppDispatch();
  const screeningCriteria = useAppSelector((s) => s.listingForm.formData.screeningCriteria);

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("financialHeading")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("financialSubtitle")}
        </p>
      </div>

      {/* Minimum income-to-rent ratio */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">
          {t("minIncomeToRentRatio")}
        </p>
        <Select
          value={screeningCriteria.minimumIncomeToRentRatio || "not_set"}
          onValueChange={(value) =>
            dispatch(
              setScreeningCriteria({
                minimumIncomeToRentRatio: value === "not_set" ? null : value,
              })
            )
          }
        >
          <SelectTrigger className="h-12! w-full text-base sm:w-80">
            <SelectValue placeholder={t("notSet")}>
              {(value: string) => value === "not_set" ? t("notSet") : value || null}
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
        <p className="text-xs text-muted-foreground">{t("rentSetAt")}</p>

        <div className="flex items-center gap-2">
          <Checkbox
            id="incomeNegotiable"
            checked={screeningCriteria.incomeToRentRatioNegotiable === true}
            onCheckedChange={(checked) =>
              dispatch(setScreeningCriteria({ incomeToRentRatioNegotiable: checked === true }))
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

      {/* Minimum monthly pre-tax income */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">
          {t("minMonthlyPreTaxIncome")}
        </p>
        <p className="text-sm text-muted-foreground">--</p>
      </div>

      {/* Minimum credit score */}
      <div className="space-y-2">
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
              })
            )
          }
        >
          <SelectTrigger className="h-12! w-full text-base sm:w-80">
            <SelectValue placeholder={t("notSet")}>
              {(value: string) => {
                if (!value || value === "not_set") return t("notSet");
                const match = CREDIT_SCORE_OPTIONS.find((o) => o.value === value);
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
              dispatch(setScreeningCriteria({ creditScoreNegotiable: checked === true }))
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
