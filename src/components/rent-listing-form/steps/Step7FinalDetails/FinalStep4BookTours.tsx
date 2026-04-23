"use client";

import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { setFinalDetails } from "@/store/slices/listingFormSlice";
import { CalendarDays } from "lucide-react";

export function FinalStep4BookTours() {
  const t = useTranslations("listing.finalDetails");
  const dispatch = useAppDispatch();
  const finalDetails = useAppSelector(
    (s) => s.listingForm.formData.finalDetails
  );

  const selected = finalDetails.bookingToursInstantly === true;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("bookToursHeading")}
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {t("bookToursSubtitle")}
        </p>
      </div>

      {/* Selectable card */}
      <button
        type="button"
        onClick={() =>
          dispatch(setFinalDetails({ bookingToursInstantly: !selected }))
        }
        className={`w-full max-w-xs cursor-pointer rounded-xl border-2 p-5 text-left transition-all ${
          selected
            ? "border-brand bg-brand/5"
            : "border-border bg-white hover:border-muted-foreground"
        }`}
      >
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
          <CalendarDays className="h-5 w-5 text-brand" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          {t("bookToursInstantly")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("bookToursInstantlyDesc")}
        </p>
      </button>
    </div>
  );
}
