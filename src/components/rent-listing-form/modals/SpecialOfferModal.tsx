"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SpecialOfferData } from "@/store/slices/listingFormSlice";

interface SpecialOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOffer: SpecialOfferData | null;
  onSave: (offer: SpecialOfferData) => void;
}

export function SpecialOfferModal({
  open,
  onOpenChange,
  editingOffer,
  onSave,
}: SpecialOfferModalProps) {
  const t = useTranslations("listing.rentDetails");
  const isEditing = !!editingOffer;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold border-b-3 pb-2">
            {isEditing ? t("editSpecialOfferTitle") : t("specialOfferTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground">
            {t("specialOfferDescription")}
          </DialogDescription>
        </DialogHeader>
        <SpecialOfferForm
          key={editingOffer?.offerStartDate ?? "new"}
          editingOffer={editingOffer}
          isEditing={isEditing}
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

/*  Inner form — remounts via key so useState initialises from props   */

import { useState } from "react";
import { parseISO } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Image from "next/image";

function SpecialOfferForm({
  editingOffer,
  isEditing,
  onSave,
  onCancel,
}: {
  editingOffer: SpecialOfferData | null;
  isEditing: boolean;
  onSave: (offer: SpecialOfferData) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("listing.rentDetails");
  const tCommon = useTranslations("common");

  const [startDate, setStartDate] = useState<Date | undefined>(
    editingOffer?.offerStartDate
      ? parseISO(editingOffer.offerStartDate)
      : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    editingOffer?.offerEndDate
      ? parseISO(editingOffer.offerEndDate)
      : undefined,
  );
  const [description, setDescription] = useState(
    editingOffer?.description ?? "",
  );

  function handleSave() {
    onSave({
      offerStartDate: startDate ? format(startDate, "yyyy-MM-dd") : null,
      offerEndDate: endDate ? format(endDate, "yyyy-MM-dd") : null,
      description: description || null,
    });
  }

  return (
    <>
      <div className="mt-4 space-y-4">
        {/* Date fields — side by side on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t("offerStartDate")}
            </label>
            <Popover>
              <PopoverTrigger
                className={cn(
                  "flex h-12 w-full items-center justify-start rounded-md border border-input bg-background px-3 text-left text-base font-normal hover:bg-accent hover:text-accent-foreground cursor-pointer",
                  !startDate && "text-muted-foreground",
                )}
              >
                {startDate
                  ? format(startDate, "MM/dd/yyyy")
                  : t("datePlaceholder")}
                <Image
                  src="/icons/calendar.svg"
                  alt="Calendar"
                  width={20}
                  height={20}
                  className="ml-auto"
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t("offerEndDate")}
            </label>
            <Popover>
              <PopoverTrigger
                className={cn(
                  "flex h-12 w-full items-center justify-start rounded-md border border-input bg-background px-3 text-left text-base font-normal hover:bg-accent hover:text-accent-foreground cursor-pointer",
                  !endDate && "text-muted-foreground",
                )}
              >
                {endDate ? format(endDate, "MM/dd/yyyy") : t("datePlaceholder")}
                <Image
                  src="/icons/calendar.svg"
                  alt="Calendar"
                  width={20}
                  height={20}
                  className="ml-auto"
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                />
              </PopoverContent>
            </Popover>
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
          onClick={onCancel}
          className="text-sm font-semibold text-brand hover:underline cursor-pointer"
        >
          {tCommon("cancel")}
        </button>
        <Button
          onClick={handleSave}
          className="h-10 rounded-lg bg-brand px-6 text-sm font-medium text-white btn-brand-shadow hover:bg-brand-dark"
        >
          {isEditing ? t("updateOfferButton") : t("addOfferButton")}
        </Button>
      </div>
    </>
  );
}
