"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { useRestoreDraft } from "@/hooks/rentDraft";
import { useRestoreEditListing } from "@/hooks/rentEdit";
import {
  setListingFormMode,
  type ListingFormMode,
} from "@/store/slices/listingFormSlice";
import { useRouter } from "@/i18n/routing";
import { ROUTES } from "@/lib/constants/routes";
import { clearRentCreateIntent } from "@/lib/utils/rentCreateSession";
import { Loader2 } from "lucide-react";
import { StepSubHeader } from "@/components/rent-listing-form/StepSubHeader";
import { StepProgressBar } from "@/components/rent-listing-form/StepProgressBar";
import { StepNavButtons } from "@/components/rent-listing-form/StepNavButtons";
import { Step1PropertyInfo } from "@/components/rent-listing-form/steps/Step1PropertyInfo";
import { Step2RentDetails } from "@/components/rent-listing-form/steps/Step2RentDetails";
import { Step3Media } from "@/components/rent-listing-form/steps/Step3Media";
import { Step4Amenities } from "@/components/rent-listing-form/steps/Step4Amenities";
import { Step5Screening } from "@/components/rent-listing-form/steps/Step5Screening";
import { Step6CostsAndFees } from "@/components/rent-listing-form/steps/Step6CostsAndFees";
import { Step7FinalDetails } from "@/components/rent-listing-form/steps/Step7FinalDetails";
import { Step8Review } from "@/components/rent-listing-form/steps/Step8Review";
import { Step9PayPublish } from "@/components/rent-listing-form/steps/Step9PayPublish";
import { RentStepperUiProvider } from "@/components/rent-listing-form/RentStepperUiContext";

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

// Sub-step counts per step (for display purposes)
const SUB_STEP_COUNTS: Record<number, number> = {
  3: 2, // Amenities
  4: 2, // Screening
  6: 6, // Final details
};

function getStepComponent(step: number) {
  switch (step) {
    case 0:
      return <Step1PropertyInfo />;
    case 1:
      return <Step2RentDetails />;
    case 2:
      return <Step3Media />;
    case 3:
      return <Step4Amenities />;
    case 4:
      return <Step5Screening />;
    case 5:
      return <Step6CostsAndFees />;
    case 6:
      return <Step7FinalDetails />;
    case 7:
      return <Step8Review />;
    case 8:
      return <Step9PayPublish />;
    default:
      return (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          Step {step + 1} — Coming soon
        </div>
      );
  }
}

interface StepperLayoutProps {
  draftId?: string;
  /**
   * `create` — original draft flow (first-save POST, then PUT step endpoints).
   * `edit`   — published rent listing edit flow: GET /edit preload + single
   *            full PUT on Update & Exit / Update & Publish.
   */
  mode?: ListingFormMode;
}

export function StepperLayout({
  draftId: draftIdFromUrl,
  mode: modeFromUrl = "create",
}: StepperLayoutProps) {
  const t = useTranslations("listing.steps");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector((s) => s.listingForm.currentStep);
  const currentSubStep = useAppSelector((s) => s.listingForm.currentSubStep);
  const draftId = useAppSelector((s) => s.listingForm.draftId);
  const mode = useAppSelector((s) => s.listingForm.mode);
  const placeId = useAppSelector(
    (s) => s.listingForm.formData.propertyInfo.address.placeId
  );
  const { restoreDraft } = useRestoreDraft();
  const { restoreEditListing } = useRestoreEditListing();
  const [isRestoring, setIsRestoring] = useState(
    Boolean(draftIdFromUrl)
  );

  // On mount: fetch listing/draft and hydrate Redux. In edit mode we must
  // call GET /edit (published) instead of GET /drafts. For plain
  // `/listings/create` (no id in URL) we always force mode back to `create`
  // so a prior edit-mode Redux state can't leak into the next create flow.
  useEffect(() => {
    if (!draftIdFromUrl) {
      dispatch(setListingFormMode("create"));
      return;
    }
    setIsRestoring(true);
    if (modeFromUrl === "edit") {
      dispatch(setListingFormMode("edit"));
      restoreEditListing(draftIdFromUrl).finally(() => setIsRestoring(false));
    } else {
      dispatch(setListingFormMode("create"));
      restoreDraft(draftIdFromUrl).finally(() => setIsRestoring(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Plain /listings/create (create mode only): allow only with prefilled address
  // (modal), saved draft in Redux, or [draftId] URL. Edit mode always has a URL id.
  useEffect(() => {
    if (draftIdFromUrl) return;
    if (mode === "edit") return;
    if (draftId !== null) return;
    if (placeId) return;
    clearRentCreateIntent();
    router.replace(ROUTES.HOME);
  }, [draftIdFromUrl, draftId, placeId, router, mode]);

  // beforeunload guard — warn if there's an in-progress draft or edit session
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (draftId !== null) {
        e.preventDefault();
      }
    },
    [draftId]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [currentStep, currentSubStep]);

  // Build step name + sub-step label
  const stepKey = STEP_KEYS[currentStep];
  const stepName = t(stepKey);
  const totalSubSteps = SUB_STEP_COUNTS[currentStep];
  const subStepLabel = totalSubSteps
    ? `${currentSubStep + 1} of ${totalSubSteps}`
    : undefined;

  if (isRestoring) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <RentStepperUiProvider>
      <div className="flex h-screen flex-col bg-white">
        {/* Fixed top section */}
        <div className="shrink-0">
          <StepSubHeader stepName={stepName} subStepLabel={subStepLabel} />
          <StepProgressBar />
        </div>

        {/* Scrollable bottom section */}
        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          <div className="flex flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
            {getStepComponent(currentStep)}
          </div>
          <StepNavButtons />
        </div>
      </div>
    </RentStepperUiProvider>
  );
}
