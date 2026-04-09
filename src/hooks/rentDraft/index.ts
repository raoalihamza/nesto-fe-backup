import { useAppSelector, useAppDispatch } from "@/store";
import { rentDraftService } from "@/lib/api/rentDraft.service";
import {
  restoreFromDraft,
  setIsSaving,
  setCostsAndFees,
  goToStep,
} from "@/store/slices/listingFormSlice";
import type {
  RentDraftResponse,
  ScreeningCriteriaData,
  PropertyInfoData,
} from "@/store/slices/listingFormSlice";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { clearAllDraftData } from "@/lib/utils/clearDraft";

// ── Helpers ────────────────────────────────────────────────

function buildScreeningBody(s: ScreeningCriteriaData) {
  const parseRatio = (v: string | null) => {
    if (!v) return null;
    const n = parseFloat(v.replace("x", ""));
    return isNaN(n) ? null : n;
  };
  const parseIncome = (v: string | null) => {
    if (!v) return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  };
  return {
    arePetsAllowed: s.arePetsAllowed,
    petPolicyNegotiable: s.petPolicyNegotiable,
    minimumIncomeToRentRatio: parseRatio(s.minimumIncomeToRentRatio),
    incomeToRentRatioNegotiable: s.incomeToRentRatioNegotiable,
    minimumMonthlyPreTaxIncome: parseIncome(s.minimumMonthlyPreTaxIncome),
    minimumCreditScore: s.minimumCreditScore,
    creditScoreNegotiable: s.creditScoreNegotiable,
  };
}

function buildPropertyInfoBody(p: PropertyInfoData) {
  return {
    squareFootage: p.squareFootage,
    totalBedrooms: p.totalBedrooms,
    totalBathrooms:
      p.totalBathrooms !== null ? parseFloat(p.totalBathrooms) : null,
  };
}

// ── useSaveStep ────────────────────────────────────────────

export function useSaveStep() {
  const dispatch = useAppDispatch();
  const { draftId, formData } = useAppSelector((s) => s.listingForm);

  async function saveStep(stepIndex: number): Promise<boolean> {
    dispatch(setIsSaving(true));
    try {
      let response: RentDraftResponse;

      switch (stepIndex) {
        case 0: {
          const body = buildPropertyInfoBody(formData.propertyInfo);
          response =
            draftId === null
              ? await rentDraftService.createDraft(body)
              : await rentDraftService.savePropertyInfo(draftId, body);
          break;
        }
        case 1: {
          if (!draftId) throw new Error("No draft ID");
          response = await rentDraftService.saveRentDetails(draftId, {
            monthlyRent: formData.rentDetails.monthlyRent,
            securityDeposit: formData.rentDetails.securityDeposit,
            specialOffer: formData.rentDetails.specialOffer,
          });
          break;
        }
        case 2: {
          if (!draftId) throw new Error("No draft ID");
          response = await rentDraftService.saveMediaStep(draftId);
          break;
        }
        case 3: {
          if (!draftId) throw new Error("No draft ID");
          response = await rentDraftService.saveAmenities(
            draftId,
            formData.amenities
          );
          break;
        }
        case 4: {
          if (!draftId) throw new Error("No draft ID");
          response = await rentDraftService.saveScreeningCriteria(
            draftId,
            buildScreeningBody(formData.screeningCriteria)
          );
          break;
        }
        case 5: {
          if (!draftId) throw new Error("No draft ID");
          response = await rentDraftService.saveCostsAndFeesStep(draftId);
          break;
        }
        case 6: {
          if (!draftId) throw new Error("No draft ID");
          response = await rentDraftService.saveFinalDetails(
            draftId,
            formData.finalDetails
          );
          break;
        }
        default:
          return true;
      }

      dispatch(restoreFromDraft(response));
      return true;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to save. Please try again.";
      toast.error(message);
      return false;
    } finally {
      dispatch(setIsSaving(false));
    }
  }

  return { saveStep };
}

// ── usePublishDraft ────────────────────────────────────────

export function usePublishDraft() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const draftId = useAppSelector((s) => s.listingForm.draftId);
  const draftProgress = useAppSelector((s) => s.listingForm.draftProgress);

  async function publish() {
    if (!draftId) return;
    if (!draftProgress?.publishReady) {
      toast.error("Please complete all required fields before publishing.");
      return;
    }
    dispatch(setIsSaving(true));
    try {
      await rentDraftService.publish(draftId);
      clearAllDraftData();
      router.push("/dashboard");
      toast.success("Listing published successfully!");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to publish. Please check required fields.";
      toast.error(message);
    } finally {
      dispatch(setIsSaving(false));
    }
  }

  return { publish };
}

// ── useRestoreDraft ────────────────────────────────────────

const STEP_MAP: Record<string, number> = {
  PROPERTY_INFO: 0,
  RENT_DETAILS: 1,
  MEDIA: 2,
  AMENITIES: 3,
  SCREENING_CRITERIA: 4,
  COSTS_AND_FEES: 5,
  FINAL_DETAILS: 6,
  REVIEW: 7,
  PAY_AND_PUBLISH: 8,
};

export function useRestoreDraft() {
  const dispatch = useAppDispatch();

  async function restoreDraft(draftId: string): Promise<void> {
    try {
      const response = await rentDraftService.getDraft(draftId);
      dispatch(restoreFromDraft(response));

      const stepIndex = STEP_MAP[response.progress.currentStep] ?? 0;
      dispatch(goToStep(stepIndex));
    } catch {
      try {
        sessionStorage.removeItem("nesto_rent_draft_id");
        sessionStorage.removeItem("nesto_rent_draft_step");
      } catch {
        /* ignore */
      }
    }
  }

  return { restoreDraft };
}
