"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/lib/constants/routes";

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
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [unit, setUnit] = useState("");
  const [numberOfUnits, setNumberOfUnits] = useState("");

  const propertyTypes = useMemo(
    () =>
      [
        { value: "house" as const, label: t("typeHouse") },
        {
          value: "entire_apartment_community" as const,
          label: t("typeEntireApartmentCommunity"),
        },
        {
          value: "condo_apartment_unit" as const,
          label: t("typeCondoApartmentUnit"),
        },
        { value: "townhome" as const, label: t("typeTownhome") },
      ],
    [t]
  );

  const showUnitField = propertyType === "condo_apartment_unit";
  const showNumberOfUnitsField =
    propertyType === "entire_apartment_community";

  const canSubmit = (() => {
    if (!address.trim() || !propertyType) return false;
    if (showUnitField && !unit.trim()) return false;
    if (showNumberOfUnitsField) {
      const n = Number(numberOfUnits.trim());
      if (!numberOfUnits.trim() || Number.isNaN(n) || n < 1) return false;
    }
    return true;
  })();

  const handleGetStarted = () => {
    if (!canSubmit) return;
    onOpenChange(false);
    router.push(ROUTES.OWNER.CREATE);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setAddress("");
      setPropertyType("");
      setUnit("");
      setNumberOfUnits("");
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

        <div className="mt-4 space-y-4">
          {showUnitField || showNumberOfUnitsField ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
              <div className="min-w-0 flex-1">
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  {t("streetAddress")}
                </label>
                <Input
                  placeholder={t("addressPlaceholder")}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-12 rounded-lg text-base"
                />
              </div>
              {showUnitField ? (
                <div className="shrink-0 sm:w-30">
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    {t("unit")}
                  </label>
                  <Input
                    placeholder={t("unitPlaceholder")}
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="h-12 rounded-lg text-base"
                  />
                </div>
              ) : (
                <div className="shrink-0 sm:w-36">
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    {t("numberOfUnits")}
                  </label>
                  <Input
                    inputMode="numeric"
                    placeholder={t("numberOfUnitsPlaceholder")}
                    value={numberOfUnits}
                    onChange={(e) => setNumberOfUnits(e.target.value)}
                    className="h-12 rounded-lg text-base"
                  />
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">
                {t("streetAddress")}
              </label>
              <Input
                placeholder={t("addressPlaceholder")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-12 rounded-lg text-base"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              {t("propertyType")}
            </label>
            <Select
              value={propertyType}
              onValueChange={(v) => {
                if (v == null) return;
                setPropertyType(v);
                setUnit("");
                setNumberOfUnits("");
              }}
            >
              <SelectTrigger className="h-12! w-full rounded-lg text-base">
                <SelectValue placeholder={t("propertyTypePlaceholder")}>
                  {(value: string) => {
                    const found = propertyTypes.find((p) => p.value === value);
                    return found?.label ?? null;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGetStarted}
            disabled={!canSubmit}
            className="btn-brand-shadow mt-2 h-12 w-full rounded-lg text-base bg-brand text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {t("getStarted")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
