"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { setCostsAndFees } from "@/store/slices/listingFormSlice";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminFeeModal } from "@/components/rent-listing-form/modals/AdminFeeModal";
import {
  Users,
  ParkingSquare,
  Lightbulb,
  CircleDollarSign,
  MoreHorizontal,
} from "lucide-react";
import type { FeeCategory, PropertyFee } from "@/types/property";

const FEE_CATEGORIES: {
  key: FeeCategory;
  icon: React.ReactNode;
  labelKey: string;
}[] = [
  {
    key: "administrative",
    icon: <Users className="h-4.5 w-4.5 text-muted-foreground" />,
    labelKey: "administrative",
  },
  {
    key: "parking",
    icon: <ParkingSquare className="h-4.5 w-4.5 text-muted-foreground" />,
    labelKey: "parking",
  },
  {
    key: "utilities",
    icon: <Lightbulb className="h-4.5 w-4.5 text-muted-foreground" />,
    labelKey: "utilities",
  },
  {
    key: "other",
    icon: (
      <CircleDollarSign className="h-4.5 w-4.5 text-muted-foreground" />
    ),
    labelKey: "otherCategories",
  },
];

const REQUIREMENT_LABEL: Record<string, string> = {
  included_in_base: "includedInBase",
  required: "required",
  optional: "optional",
  situational: "situational",
};

const FREQUENCY_LABEL: Record<string, string> = {
  monthly: "paidMonthly",
  annually: "paidAnnually",
  one_time: "paidOneTime",
};

export function Step6CostsAndFees() {
  const t = useTranslations("listing.costs");
  const tCommon = useTranslations("common");
  const dispatch = useAppDispatch();
  const costsAndFees = useAppSelector(
    (s) => s.listingForm.formData.costsAndFees
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<FeeCategory>("administrative");
  const [editingFee, setEditingFee] = useState<PropertyFee | null>(null);

  function handleAddFee(category: FeeCategory) {
    setModalCategory(category);
    setEditingFee(null);
    setModalOpen(true);
  }

  function handleEditFee(fee: PropertyFee) {
    setModalCategory(fee.category);
    setEditingFee(fee);
    setModalOpen(true);
  }

  function handleDeleteFee(feeId: string) {
    dispatch(
      setCostsAndFees({
        fees: costsAndFees.fees.filter((f) => f.id !== feeId),
      })
    );
  }

  function handleSaveFee(fee: PropertyFee) {
    if (editingFee) {
      dispatch(
        setCostsAndFees({
          fees: costsAndFees.fees.map((f) => (f.id === fee.id ? fee : f)),
        })
      );
    } else {
      dispatch(
        setCostsAndFees({
          fees: [...costsAndFees.fees, fee],
        })
      );
    }
    setModalOpen(false);
    setEditingFee(null);
  }

  function getFeesForCategory(category: FeeCategory) {
    return costsAndFees.fees.filter((f) => f.category === category);
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">
          {t("title")}
        </p>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("heading")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Toggle card */}
      <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {t("showTotalMonthlyPrice")}
            </p>
            <p className="text-xs text-muted-foreground">{t("turnOnIf")}</p>
            <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
              <li>{t("showTotalBullet1")}</li>
              <li>{t("showTotalBullet2")}</li>
            </ul>
            <button
              type="button"
              className="text-xs font-semibold text-brand hover:underline"
            >
              {tCommon("learnMore")}
            </button>
          </div>
          <Switch
            checked={costsAndFees.showTotalMonthlyPrice}
            onCheckedChange={(checked) =>
              dispatch(setCostsAndFees({ showTotalMonthlyPrice: checked }))
            }
          />
        </div>
      </div>

      {/* Fee categories */}
      <div className="divide-y divide-border">
        {FEE_CATEGORIES.map((cat) => {
          const fees = getFeesForCategory(cat.key);
          return (
            <div key={cat.key}>
              {/* Category row */}
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  {cat.icon}
                  <span className="text-sm font-medium text-foreground">
                    {t(cat.labelKey)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddFee(cat.key)}
                  className="text-sm font-semibold text-foreground hover:text-brand underline cursor-pointer"
                >
                  {t("add")}
                </button>
              </div>

              {/* Fee items for this category */}
              {fees.map((fee) => (
                <div
                  key={fee.id}
                  className="border-t border-border py-3 pl-8"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">
                        {fee.name}
                      </p>
                      {fee.description && (
                        <p className="text-xs text-muted-foreground">
                          {fee.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          ${fee.amount}
                        </span>{" "}
                        {t("each")}, {t(FREQUENCY_LABEL[fee.paymentFrequency])}{" "}
                        | {t(REQUIREMENT_LABEL[fee.isRequired])} |{" "}
                        {fee.isRefundable ? t("refundable") : t("nonRefundable")}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-accent cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditFee(fee)}>
                          {tCommon("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteFee(fee.id)}
                        >
                          {tCommon("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <AdminFeeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        category={modalCategory}
        editingFee={editingFee}
        onSave={handleSaveFee}
      />
    </div>
  );
}
