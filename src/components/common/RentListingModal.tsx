"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ROUTES } from "@/lib/constants/routes";
import { RentAddressAndListingEntryFields } from "@/components/rent-listing-form/shared/RentAddressAndListingEntryFields";
import { setRentCreateIntent } from "@/lib/utils/rentCreateSession";

/** Let the client start navigation before unmounting the dialog (avoids close-then-navigate flash). */
function deferToNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

interface RentListingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RentListingModal({
  open,
  onOpenChange,
}: RentListingModalProps) {
  const t = useTranslations("rentListingModal");
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl p-6 sm:max-w-xl sm:p-8">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-center text-xl font-bold leading-tight sm:text-2xl">
            {t("titlePrefix")}{" "}
            <span className="text-brand">{t("titleHighlight")}</span>
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <RentAddressAndListingEntryFields
            variant="modal"
            enabled={open}
            onRequestClose={() => onOpenChange(false)}
            onModalComplete={async () => {
              setRentCreateIntent();
              router.push(ROUTES.OWNER.CREATE);
              await deferToNextPaint();
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
