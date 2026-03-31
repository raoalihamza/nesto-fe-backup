"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type {
  FeeCategory,
  FeeFormat,
  FeeFrequency,
  FeeRequirement,
  PropertyFee,
} from "@/types/property";

interface AdminFeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: FeeCategory;
  editingFee: PropertyFee | null;
  onSave: (fee: PropertyFee) => void;
}

const FEE_NAMES_BY_CATEGORY: Record<FeeCategory, string[]> = {
  administrative: ["application_fee", "administrative_fee", "move_in_fee"],
  parking: ["parking_fee"],
  utilities: ["utilities_fee", "water", "gas", "electric", "internet"],
  other: ["storage_fee", "other"],
};

const TITLE_KEY_BY_CATEGORY: Record<FeeCategory, string> = {
  administrative: "adminFeeTitle",
  parking: "parkingFeeTitle",
  utilities: "utilitiesFeeTitle",
  other: "otherFeeTitle",
};

export function AdminFeeModal({
  open,
  onOpenChange,
  category,
  editingFee,
  onSave,
}: AdminFeeModalProps) {
  const t = useTranslations("listing.costs");
  const tCommon = useTranslations("common");

  const [name, setName] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState<FeeFrequency | "">("");
  const [format, setFormat] = useState<FeeFormat | "">("");
  const [amount, setAmount] = useState<number>(0);
  const [isRequired, setIsRequired] = useState<FeeRequirement>("included_in_base");
  const [isRefundable, setIsRefundable] = useState(false);
  const [description, setDescription] = useState("");

  function resetForm() {
    setName("");
    setPaymentFrequency("");
    setFormat("");
    setAmount(0);
    setIsRequired("included_in_base");
    setIsRefundable(false);
    setDescription("");
  }

  useCallback(() => {
    if (editingFee) {
      setName(editingFee.name);
      setPaymentFrequency(editingFee.paymentFrequency);
      setFormat(editingFee.format);
      setAmount(editingFee.amount);
      setIsRequired(editingFee.isRequired);
      setIsRefundable(editingFee.isRefundable);
      setDescription(editingFee.description ?? "");
    } else {
      resetForm();
    }
  }, [editingFee, open]);

  function handleSave() {
    const fee: PropertyFee = {
      id: editingFee?.id ?? Date.now().toString(),
      category,
      name,
      paymentFrequency: paymentFrequency as FeeFrequency,
      format: format as FeeFormat,
      amount,
      isRequired,
      isRefundable,
      description: description || undefined,
    };
    onSave(fee);
    resetForm();
  }

  function handleCancel() {
    onOpenChange(false);
    resetForm();
  }

  const feeNameOptions = FEE_NAMES_BY_CATEGORY[category];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] overflow-y-auto" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold border-b-3 pb-2">
            {t(TITLE_KEY_BY_CATEGORY[category])}
          </DialogTitle>
          <DialogDescription className="text-sm pt-1 text-foreground">
            {t("adminFeeSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-1 space-y-5">
          {/* Row 1: Fee name + Payment frequency */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {t("feeName")}
                <span className="text-brand">*</span>
              </label>
              <Select value={name} onValueChange={(v) => setName(v ?? "")}>
                <SelectTrigger className="h-12! w-full text-base">
                  <SelectValue placeholder={t("selectFeeName")} />
                </SelectTrigger>
                <SelectContent>
                  {feeNameOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {t(`feeNames.${opt}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {t("paymentFrequency")}
                <span className="text-brand">*</span>
              </label>
              <Select
                value={paymentFrequency}
                onValueChange={(v) => setPaymentFrequency(v as FeeFrequency)}
              >
                <SelectTrigger className="h-12! w-full text-base">
                  <SelectValue placeholder={t("selectFrequency")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t("monthly")}</SelectItem>
                  <SelectItem value="annually">{t("annually")}</SelectItem>
                  <SelectItem value="one_time">{t("oneTime")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Fee format + Fee amount */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {t("feeFormat")}
                <span className="text-brand">*</span>
              </label>
              <Select
                value={format}
                onValueChange={(v) => setFormat(v as FeeFormat)}
              >
                <SelectTrigger className="h-12! w-full text-base">
                  <SelectValue placeholder={t("selectFormat")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">{t("fixedAmount")}</SelectItem>
                  <SelectItem value="percentage">{t("percentage")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {t("feeAmount")}
                <span className="text-brand">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                  {format === "percentage" ? "%" : "$"}
                </span>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount || ""}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="h-12 pl-7 text-base"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Is required + Is refundable */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                {t("isRequired")}
                <span className="text-brand">*</span>
              </p>
              <RadioGroup
                value={isRequired}
                onValueChange={(v) => setIsRequired(v as FeeRequirement)}
                className="space-y-2"
              >
                {(
                  [
                    "included_in_base",
                    "required",
                    "optional",
                    "situational",
                  ] as FeeRequirement[]
                ).map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem
                      value={opt}
                      id={`req-${opt}`}
                      className="border-brand text-brand"
                    />
                    <Label htmlFor={`req-${opt}`} className="text-sm cursor-pointer">
                      {t(
                        opt === "included_in_base"
                          ? "includedInBase"
                          : opt === "required"
                            ? "required"
                            : opt === "optional"
                              ? "optional"
                              : "situational"
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                {t("isRefundable")}
                <span className="text-muted-foreground">
                  ({tCommon("optional")})
                </span>
              </p>
              <RadioGroup
                value={isRefundable ? "refundable" : "non_refundable"}
                onValueChange={(v) => setIsRefundable(v === "refundable")}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="non_refundable"
                    id="ref-no"
                    className="border-brand text-brand"
                  />
                  <Label htmlFor="ref-no" className="text-sm cursor-pointer">
                    {t("nonRefundable")}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="refundable"
                    id="ref-yes"
                    className="border-brand text-brand"
                  />
                  <Label htmlFor="ref-yes" className="text-sm cursor-pointer">
                    {t("refundable")}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t("description")}
              <span className="text-muted-foreground">
                ({tCommon("optional")})
              </span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] text-base"
            />
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
            onClick={handleSave}
            className="h-10 rounded-lg bg-brand px-6 text-sm font-medium text-white btn-brand-shadow hover:bg-brand-dark"
          >
            {tCommon("save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
