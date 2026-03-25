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

interface ListingTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ListingTypeModal({ open, onOpenChange }: ListingTypeModalProps) {
  const t = useTranslations("home");
  const router = useRouter();
  const [selected, setSelected] = useState<"sell" | "rent" | null>(null);

  const handleContinue = () => {
    if (selected) {
      onOpenChange(false);
      router.push("/listings/create");
    }
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
            onClick={() => setSelected("sell")}
            className={cn(
              "flex flex-1 flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
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
            onClick={() => setSelected("rent")}
            className={cn(
              "flex flex-1 flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
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
