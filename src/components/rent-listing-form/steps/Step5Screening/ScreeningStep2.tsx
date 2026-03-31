"use client";

import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { setScreening } from "@/store/slices/listingFormSlice";
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

export function ScreeningStep2() {
  const t = useTranslations("listing.screening");
  const dispatch = useAppDispatch();
  const screening = useAppSelector((s) => s.listingForm.formData.screening);

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
          value={screening.minIncomeToRentRatio || "not_set"}
          onValueChange={(value) =>
            dispatch(
              setScreening({
                minIncomeToRentRatio: value === "not_set" ? "" : (value ?? ""),
              })
            )
          }
        >
          <SelectTrigger className="h-12! w-full text-base sm:w-80">
            <SelectValue placeholder={t("notSet")} />
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
            checked={screening.incomeNegotiable}
            onCheckedChange={(checked) =>
              dispatch(setScreening({ incomeNegotiable: checked === true }))
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
          value={screening.minCreditScore || "not_set"}
          onValueChange={(value) =>
            dispatch(
              setScreening({
                minCreditScore: value === "not_set" ? "" : (value ?? ""),
              })
            )
          }
        >
          <SelectTrigger className="h-12! w-full text-base sm:w-80">
            <SelectValue placeholder={t("notSet")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_set">{t("notSet")}</SelectItem>
            <SelectItem value="fair">{t("creditFair")}</SelectItem>
            <SelectItem value="good">{t("creditGood")}</SelectItem>
            <SelectItem value="very_good">{t("creditVeryGood")}</SelectItem>
            <SelectItem value="exceptional">
              {t("creditExceptional")}
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Checkbox
            id="creditNegotiable"
            checked={screening.creditNegotiable}
            onCheckedChange={(checked) =>
              dispatch(setScreening({ creditNegotiable: checked === true }))
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
