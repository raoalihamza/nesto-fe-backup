"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { setRentDetails } from "@/store/slices/listingFormSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SpecialOfferModal } from "@/components/rent-listing-form/modals/SpecialOfferModal";

export function Step2RentDetails() {
  const t = useTranslations("listing.rentDetails");
  const dispatch = useAppDispatch();
  const data = useAppSelector((s) => s.listingForm.formData.rentDetails);
  const [modalOpen, setModalOpen] = useState(false);

  const rentDisplay = data.monthlyRent ? `$${data.monthlyRent.toLocaleString()}` : "$0";

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {t("heading")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>

      <p className="mt-3 text-sm text-foreground">
        {t("rentNestimate", { amount: "$1,495" })}
      </p>

      <div className="mt-8 space-y-6">
        {/* Monthly rent */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t("monthlyRent")} <span className="text-brand">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              min={0}
              value={data.monthlyRent ?? ""}
              onChange={(e) =>
                dispatch(
                  setRentDetails({
                    monthlyRent: e.target.value ? Number(e.target.value) : null,
                  })
                )
              }
              className="h-12 pr-16 pl-8 text-base"
            />
            <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">
              {t("perMonth")}
            </span>
          </div>
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
              type="number"
              min={0}
              value={data.securityDeposit ?? ""}
              onChange={(e) =>
                dispatch(
                  setRentDetails({
                    securityDeposit: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                )
              }
              className="h-12 pl-8 text-base"
            />
          </div>
          {data.monthlyRent && data.monthlyRent > 0 && (
            <button
              type="button"
              onClick={() =>
                dispatch(
                  setRentDetails({ securityDeposit: data.monthlyRent })
                )
              }
              className="mt-1.5 text-sm font-medium text-brand hover:underline"
            >
              {t("setDepositAsRent", { amount: rentDisplay })}
            </button>
          )}
        </div>

        {/* Special offer section */}
        <div>
          <p className="text-sm font-medium text-foreground">
            {t("promoteOffer")}
          </p>
          <Button
            variant="outline"
            onClick={() => setModalOpen(true)}
            className="mt-3 h-10 rounded-lg px-4 text-sm font-medium"
          >
            {t("addOffer")}
          </Button>
        </div>
      </div>

      <SpecialOfferModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
