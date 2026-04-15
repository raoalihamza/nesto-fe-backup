"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Home, Search } from "lucide-react";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            {t("chooseOption")}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex gap-4">
          <button
            type="button"
            onClick={() => setSelected("sell")}
            className={cn(
              "flex flex-1 flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all cursor-pointer",
              selected === "sell"
                ? "border-brand bg-brand-light"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full",
                selected === "sell" ? "bg-brand/10" : "bg-gray-100"
              )}
            >
              <Home
                className={cn(
                  "h-8 w-8",
                  selected === "sell" ? "text-brand" : "text-gray-500"
                )}
              />
            </div>
            <span className="text-center text-sm font-medium">{t("wantToSale")}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelected("rent")}
            className={cn(
              "flex flex-1 flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all cursor-pointer",
              selected === "rent"
                ? "border-brand bg-brand-light"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full",
                selected === "rent" ? "bg-brand/10" : "bg-gray-100"
              )}
            >
              <Search
                className={cn(
                  "h-8 w-8",
                  selected === "rent" ? "text-brand" : "text-gray-500"
                )}
              />
            </div>
            <span className="text-center text-sm font-medium">{t("wantToRent")}</span>
          </button>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selected}
          className="btn-brand-shadow mt-4 h-11 w-full rounded-lg bg-brand text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {t("continue")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
