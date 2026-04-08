"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAppDispatch } from "@/store";
import { setRentDetails } from "@/store/slices/listingFormSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface SpecialOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SpecialOfferModal({
  open,
  onOpenChange,
}: SpecialOfferModalProps) {
  const t = useTranslations("listing.rentDetails");
  const tCommon = useTranslations("common");
  const dispatch = useAppDispatch();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  function handleAddOffer() {
    dispatch(
      setRentDetails({
        specialOffer: {
          offerStartDate: startDate || null,
          offerEndDate: endDate || null,
          description: description || null,
        },
      }),
    );
    onOpenChange(false);
    setStartDate("");
    setEndDate("");
    setDescription("");
  }

  function handleCancel() {
    onOpenChange(false);
    setStartDate("");
    setEndDate("");
    setDescription("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold border-b-3 pb-2">
            {t("specialOfferTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground">
            {t("specialOfferDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Date fields — side by side on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {t("offerStartDate")}
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t("datePlaceholder")}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-12 pr-10 text-base"
                />
                <div className="absolute top-1/2 right-3  -translate-y-1/2 text-foreground cursor-pointer">
                  <Image
                    src="/icons/calendar.svg"
                    alt="Calendar"
                    width={20}
                    height={20}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {t("offerEndDate")}
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t("datePlaceholder")}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-12 pr-10 text-base"
                />
                <div className="absolute top-1/2 right-3  -translate-y-1/2 text-foreground cursor-pointer">
                  <Image
                    src="/icons/calendar.svg"
                    alt="Calendar"
                    width={20}
                    height={20}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t("offerDescriptionLabel")}
            </label>
            <Textarea
              placeholder={t("offerDescriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] text-base"
            />
            <p className="mt-2 text-xs text-muted-foreground border-b pb-2 px-2">
              {t("offerWarning")}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm font-semibold text-brand hover:underline cursor-pointer"
          >
            {tCommon("cancel")}
          </button>
          <Button
            onClick={handleAddOffer}
            className="h-10 rounded-lg bg-brand px-6 text-sm font-medium text-white btn-brand-shadow hover:bg-brand-dark"
          >
            {t("addOfferButton")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
