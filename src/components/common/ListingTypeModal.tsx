"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants/routes";

interface ListingTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * When user chooses rent and Continue: called instead of navigating to create.
   * Omit to fall back to `router.push(ROUTES.OWNER.CREATE)` (e.g. legacy callers).
   */
  onRentChosen?: () => void;
}

export function ListingTypeModal({
  open,
  onOpenChange,
  onRentChosen,
}: ListingTypeModalProps) {
  const t = useTranslations("home");
  const router = useRouter();
  const [selected, setSelected] = useState<"sell" | "rent" | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    onOpenChange(false);
    if (selected === "sell") {
      router.push(ROUTES.OWNER.SALE);
      return;
    }
    if (onRentChosen) {
      onRentChosen();
      return;
    }
    router.push(ROUTES.OWNER.CREATE);
  };

  const options: Array<{
    id: "sell" | "rent";
    icon: string;
    label: string;
  }> = [
    { id: "sell", icon: "/icons/sale-listing.svg", label: t("wantToSale") },
    { id: "rent", icon: "/icons/rent-listing.svg", label: t("wantToRent") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg rounded-2xl px-4 py-8 sm:min-w-[600px] sm:px-8 sm:py-16">
        <DialogHeader>
          <DialogTitle className="text-center text-base font-semibold sm:text-lg">
            {t("chooseOption")}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex gap-3 sm:mt-6 sm:gap-4">
          {options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelected(opt.id)}
                aria-pressed={isSelected}
                className={cn(
                  "flex h-40 flex-1 flex-col justify-between rounded-xl border bg-white p-3 text-left transition-all cursor-pointer sm:h-56 sm:p-5",
                  isSelected
                    ? "border-brand ring-1 ring-brand"
                    : "border-border hover:border-gray-300",
                )}
              >
                <div className="flex w-full flex-col items-center justify-center gap-2 pt-2 sm:gap-4 sm:pt-3">
                  <Image
                    src={opt.icon}
                    alt=""
                    aria-hidden="true"
                    width={96}
                    height={96}
                    className="h-14 w-14 sm:h-24 sm:w-24"
                  />
                  <span className="text-xs font-medium text-foreground sm:text-sm">
                    {opt.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selected}
          className={cn(
            "mx-auto mt-6 h-11 w-full rounded-lg text-sm font-medium transition-colors cursor-pointer sm:mt-10 sm:w-1/3",
            selected
              ? "btn-brand-shadow bg-brand text-white hover:bg-brand-dark"
              : "bg-brand-light text-brand hover:bg-brand-light",
          )}
        >
          {t("continue")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
