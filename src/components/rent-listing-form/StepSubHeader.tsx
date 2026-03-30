"use client";

import { SaveExitButton } from "@/components/rent-listing-form/SaveExitButton";

interface StepSubHeaderProps {
  stepName: string;
  subStepLabel?: string;
}

export function StepSubHeader({ stepName, subStepLabel }: StepSubHeaderProps) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-4 py-3 sm:px-6 lg:px-8">
      <span className="text-sm font-medium text-foreground">
        {stepName}
        {subStepLabel && (
          <span className="text-muted-foreground"> ({subStepLabel})</span>
        )}
      </span>
      <SaveExitButton />
    </div>
  );
}
