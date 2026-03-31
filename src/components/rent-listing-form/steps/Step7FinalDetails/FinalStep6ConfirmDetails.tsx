"use client";

import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { goToSubStep } from "@/store/slices/listingFormSlice";

export function FinalStep6ConfirmDetails() {
  const t = useTranslations("listing.finalDetails");
  const tCommon = useTranslations("common");
  const dispatch = useAppDispatch();
  const finalDetails = useAppSelector(
    (s) => s.listingForm.formData.finalDetails
  );

  const rows = [
    {
      label: t("hidePropertyAddress"),
      value: finalDetails.hideAddress ? t("yes") : t("no"),
      learnMore: true,
      editSubStep: 0,
    },
    {
      label: t("dateAvailable"),
      value: finalDetails.dateAvailable || "03/06/2026",
      editSubStep: 0,
    },
    {
      label: (
        <>
          {t("leaseDuration")}
          <span className="text-brand">*</span>
        </>
      ),
      value: finalDetails.leaseDuration || "1 year",
      editSubStep: 0,
    },
    {
      label: t("allowPhoneContact"),
      value: finalDetails.allowPhoneContact ? t("yes") : t("no"),
      learnMore: true,
      editSubStep: 2,
    },
    {
      label: t("acceptOnlineApplications"),
      value: finalDetails.acceptOnlineApplications ? t("yes") : t("no"),
      editSubStep: 0,
    },
  ];

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("confirmHeading")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("confirmSubtitle")}
        </p>
      </div>

      {/* Confirm detail rows */}
      <div className="divide-y divide-border">
        {rows.map((row, i) => (
          <div key={i} className="flex items-start justify-between py-4">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">
                {row.label}
                {row.learnMore && (
                  <span className="ml-2 cursor-pointer text-sm font-medium text-brand">
                    {tCommon("learnMore")}
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{row.value}</p>
            </div>
            <button
              type="button"
              onClick={() => dispatch(goToSubStep(row.editSubStep))}
              className="hidden shrink-0 text-sm font-medium text-foreground sm:block"
            >
              {tCommon("edit")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
