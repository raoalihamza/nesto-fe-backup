"use client";

import { useAppSelector } from "@/store";
import { FinalStep1LeaseTerms } from "./FinalStep1LeaseTerms";
import { FinalStep2ListedBy } from "./FinalStep2ListedBy";
import { FinalStep3PhoneVerify } from "./FinalStep3PhoneVerify";
import { FinalStep4BookTours } from "./FinalStep4BookTours";
import { FinalStep5Description } from "./FinalStep5Description";
import { FinalStep6ConfirmDetails } from "./FinalStep6ConfirmDetails";

export function Step7FinalDetails() {
  const currentSubStep = useAppSelector((s) => s.listingForm.currentSubStep);

  switch (currentSubStep) {
    case 0:
      return <FinalStep1LeaseTerms />;
    case 1:
      return <FinalStep2ListedBy />;
    case 2:
      return <FinalStep3PhoneVerify />;
    case 3:
      return <FinalStep4BookTours />;
    case 4:
      return <FinalStep5Description />;
    case 5:
      return <FinalStep6ConfirmDetails />;
    default:
      return <FinalStep1LeaseTerms />;
  }
}
