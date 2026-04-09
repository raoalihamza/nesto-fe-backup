"use client";

import { useState } from "react";
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

export function Step2RentDetails() {
  const t = useTranslations("listing.rentDetails");
  const tCommon = useTranslations("common");
  const dispatch = useAppDispatch();
  const data = useAppSelector((s) => s.listingForm.formData.rentDetails);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOfferData | null>(
    null
  );

  const rentDisplay = data.monthlyRent
    ? `$${data.monthlyRent.toLocaleString()}`
    : "$0";

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
          <button
            type="button"
            onClick={() =>
              dispatch(
                setRentDetails({ securityDeposit: data.monthlyRent ?? 500 })
              )
            }
            className="mt-1.5 text-sm font-medium text-brand underline"
          >
            {t("setDepositAsRent", { amount: rentDisplay })}
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
                  <DropdownMenuTrigger className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-accent cursor-pointer">
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
              className="mt-3 h-10 rounded-lg px-4 text-sm font-medium cursor-pointer"
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
