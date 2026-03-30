"use client";

import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEP_KEYS = [
  "propertyInfo",
  "rentDetails",
  "media",
  "amenities",
  "screeningCriteria",
  "costsAndFees",
  "finalDetails",
  "review",
  "payAndPublish",
] as const;

export function StepProgressBar() {
  const t = useTranslations("listing.steps");
  const currentStep = useAppSelector((s) => s.listingForm.currentStep);
  const completedSteps = useAppSelector((s) => s.listingForm.completedSteps);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
      {/* Progress bar with dots + labels */}
      <div className="relative flex justify-between">
        {/* Lines — vertically centered */}
        <div className="absolute top-2.5 right-0 left-0 h-1 -translate-y-1/2 bg-gray-200" />
        {currentStep > 0 && (
          <div
            className="absolute top-2.5 left-0 h-1 -translate-y-1/2 bg-brand"
            style={{
              width: `${(currentStep / (STEP_KEYS.length - 1)) * 100}%`,
            }}
          />
        )}

        {/* Dot + label columns */}
        {STEP_KEYS.map((key, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;
          const isPast = index < currentStep;

          return (
            <div
              key={key}
              className="relative z-10 flex w-0 flex-col items-center"
            >
              {/* Fixed-height wrapper */}
              <div className="flex h-5 items-center justify-center">
                {isCurrent ? (
                  <div className="flex size-5 items-center justify-center rounded-full border-3 border-brand/20 bg-white">
                    <div className="size-1.5 rounded-full bg-brand" />
                  </div>
                ) : isCompleted || isPast ? (
                  <div className="flex size-3.5 items-center justify-center rounded-full bg-brand">
                    <Check className="size-2.5 text-white" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="size-2 rounded-full border-2 border-brand/30 bg-white" />
                )}
              </div>

              {/* Label — centered under its dot */}
              <span
                className={cn(
                  "mt-1.5 w-20 text-center text-xs leading-tight",
                  isCurrent
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground",
                  isCurrent ? "block" : "hidden sm:block",
                )}
              >
                {t(key)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
