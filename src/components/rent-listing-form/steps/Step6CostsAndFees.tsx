"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { setCostsAndFees } from "@/store/slices/listingFormSlice";
import { rentDraftService } from "@/lib/api/rentDraft.service";
import { toast } from "sonner";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeFee(f: any): PropertyFee {
  return { ...f, feeId: f.feeId || f.id };
}

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
  required: "required",
  optional: "optional",
  situational: "situational",
};

const FREQUENCY_LABEL: Record<string, string> = {
  one_time: "oneTime",
  monthly: "monthly",
  weekly: "weekly",
  yearly: "yearly",
  per_lease: "perLease",
  per_occurrence: "perOccurrence",
  other: "other",
};

export function Step6CostsAndFees() {
  const t = useTranslations("listing.costs");
  const tCommon = useTranslations("common");
  const dispatch = useAppDispatch();
  const rawCostsAndFees = useAppSelector(
    (s) => s.listingForm.formData.costsAndFees
  );
  const draftId = useAppSelector((s) => s.listingForm.draftId);

  const fees = useMemo(
    () => rawCostsAndFees.fees.map(normalizeFee),
    [rawCostsAndFees.fees]
  );

  const [showTotalMonthlyPrice, setShowTotalMonthlyPrice] = useState(false);
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

  async function handleDeleteFee(feeId: string) {
    if (!draftId) return;
    try {
      await rentDraftService.deleteFee(draftId, feeId);
      dispatch(
        setCostsAndFees({
          fees: fees.filter((f) => f.feeId !== feeId),
        })
      );
    } catch {
      toast.error("Failed to delete fee.");
    }
  }

  async function handleSaveFee(
    feeData: Omit<PropertyFee, "feeId"> & { feeId?: string }
  ) {
    if (!draftId) {
      toast.error("Please complete previous steps first.");
      return;
    }

    try {
      if (editingFee) {
        await rentDraftService.updateFee(draftId, editingFee.feeId, {
          category: feeData.category,
          feeName: feeData.feeName,
          paymentFrequency: feeData.paymentFrequency,
          feeFormat: feeData.feeFormat,
          feeAmount: feeData.feeAmount,
          feeRequiredType: feeData.feeRequiredType,
          refundability: feeData.refundability,
          description: feeData.description,
        });
      } else {
        await rentDraftService.createFee(draftId, {
          category: feeData.category,
          feeName: feeData.feeName,
          paymentFrequency: feeData.paymentFrequency,
          feeFormat: feeData.feeFormat,
          feeAmount: feeData.feeAmount,
          feeRequiredType: feeData.feeRequiredType,
          refundability: feeData.refundability,
          description: feeData.description,
        });
      }
      const draft = await rentDraftService.getDraft(draftId);
      dispatch(setCostsAndFees({
        fees: draft.costsAndFees.fees.map(normalizeFee),
      }));
      setModalOpen(false);
      setEditingFee(null);
    } catch {
      toast.error("Failed to save fee. Please try again.");
    }
  }

  function getFeesForCategory(category: FeeCategory) {
    return fees.filter((f) => f.category === category);
  }

  return (
    <div className="w-full space-y-6">
      <div>
        {/* <p className="text-xs font-medium text-muted-foreground mb-1">
          {t("title")}
        </p> */}
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("heading")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {t("subtitle")}
        </p>
      </div>

      {/* Toggle card */}
      {/* <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 max-w-md">
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
            checked={showTotalMonthlyPrice}
            onCheckedChange={setShowTotalMonthlyPrice}
          />
        </div>
      </div> */}

      {/* Fee categories */}
      <div className="divide-y divide-border max-w-md">
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
                  key={fee.feeId}
                  className="border-t border-border py-3 pl-8"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">
                        {fee.feeName}
                      </p>
                      {fee.description && (
                        <p className="text-xs text-muted-foreground">
                          {fee.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          ${fee.feeAmount}
                        </span>{" "}
                        {t("each")}, {t(FREQUENCY_LABEL[fee.paymentFrequency])}{" "}
                        | {t(REQUIREMENT_LABEL[fee.feeRequiredType])} |{" "}
                        {fee.refundability === "refundable"
                          ? t("refundable")
                          : t("nonRefundable")}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-accent cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditFee(fee)}
                          className="cursor-pointer"
                        >
                          {tCommon("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteFee(fee.feeId)}
                          className="cursor-pointer"
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
