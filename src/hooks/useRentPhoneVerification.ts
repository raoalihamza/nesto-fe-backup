"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type AuthError,
  type ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";
import type { RentDraftResponse } from "@/store/slices/listingFormSlice";
import { getFirebaseAuth } from "@/lib/firebase/app";
import { rentDraftService } from "@/lib/api/rentDraft.service";
import { rentListingEditService } from "@/lib/api/rentListingEdit.service";

export type PhoneVerificationPhase =
  | "phoneInput"
  | "sendingOtp"
  | "otpSent"
  | "verifyingOtp"
  | "submittingBackend"
  | "verified"
  | "error";

export type PhoneVerificationErrorKey =
  | "missing_draft_id"
  | "invalid_phone_number"
  | "missing_otp"
  | "invalid_otp"
  | "otp_expired"
  | "too_many_requests"
  | "captcha_failed"
  | "network_error"
  | "unexpected_error";

export interface UseRentPhoneVerificationOptions {
  draftId: string | null;
  recaptchaContainerId: string;
  initialPhone?: string | null;
  initialVerified?: boolean;
  /**
   * Selects which backend verify endpoint to hit after the Firebase OTP succeeds:
   * - `create` (default) — `POST /v1/listings/rent/drafts/:draftId/verify-phone`
   * - `edit`             — `POST /v1/listings/rent/:listingId/verify-phone`
   */
  mode?: "create" | "edit";
}

function normalizePhoneToE164(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

function isValidE164Phone(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

function mapFirebaseError(error: unknown): PhoneVerificationErrorKey {
  const code = (error as AuthError | undefined)?.code;

  if (process.env.NODE_ENV !== "production") {
    console.warn("[useRentPhoneVerification] firebase error:", code, error);
  }

  switch (code) {
    case "auth/invalid-phone-number":
    case "auth/missing-phone-number":
      return "invalid_phone_number";
    case "auth/invalid-verification-code":
      return "invalid_otp";
    case "auth/code-expired":
      return "otp_expired";
    case "auth/too-many-requests":
    case "auth/quota-exceeded":
      return "too_many_requests";
    case "auth/captcha-check-failed":
    case "auth/invalid-app-credential":
    case "auth/internal-error":
      return "captcha_failed";
    case "auth/network-request-failed":
      return "network_error";
    default:
      return "unexpected_error";
  }
}

export function useRentPhoneVerification({
  draftId,
  recaptchaContainerId,
  initialPhone,
  initialVerified = false,
  mode = "create",
}: UseRentPhoneVerificationOptions) {
  const auth = useMemo(() => getFirebaseAuth(), []);
  const [phase, setPhase] = useState<PhoneVerificationPhase>(
    initialVerified ? "verified" : "phoneInput"
  );
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [errorKey, setErrorKey] = useState<PhoneVerificationErrorKey | null>(
    null
  );
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaWidgetIdRef = useRef<number | null>(null);
  const lastSubmittedPhoneRef = useRef<string>(initialPhone ?? "");

  const clearRecaptcha = useCallback(() => {
    if (recaptchaRef.current) {
      try {
        recaptchaRef.current.clear();
      } catch {
        // Ignore — verifier may already be torn down.
      }
      recaptchaRef.current = null;
    }
    recaptchaWidgetIdRef.current = null;
    if (typeof document !== "undefined") {
      const container = document.getElementById(recaptchaContainerId);
      if (container) container.innerHTML = "";
    }
  }, [recaptchaContainerId]);

  // Firebase's invisible reCAPTCHA token is single-use: once consumed by
  // signInWithPhoneNumber (success OR failure), the next attempt needs a
  // fresh token. Destroying and re-creating the verifier on the same
  // container is unreliable (leftover iframes / widget-id collisions), so
  // we keep ONE verifier alive and reset the widget between attempts.
  const ensureFreshRecaptcha = useCallback(async () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: "invisible",
      });
      recaptchaWidgetIdRef.current = await recaptchaRef.current.render();
      return recaptchaRef.current;
    }

    try {
      const widgetId = await recaptchaRef.current.render();
      recaptchaWidgetIdRef.current = widgetId;
      const grecaptcha = (
        globalThis as typeof globalThis & {
          grecaptcha?: { reset?: (id?: number) => void };
        }
      ).grecaptcha;
      grecaptcha?.reset?.(widgetId);
      return recaptchaRef.current;
    } catch {
      // Render failed (e.g. DOM was torn down). Rebuild from scratch.
      clearRecaptcha();
      recaptchaRef.current = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: "invisible",
      });
      recaptchaWidgetIdRef.current = await recaptchaRef.current.render();
      return recaptchaRef.current;
    }
  }, [auth, clearRecaptcha, recaptchaContainerId]);

  const resetToInput = useCallback(
    (nextPhone?: string) => {
      setPhase("phoneInput");
      setErrorKey(null);
      if (typeof nextPhone === "string") {
        setPhone(nextPhone);
      }
      confirmationRef.current = null;
    },
    []
  );

  const sendCode = useCallback(
    async (rawPhone: string) => {
      const normalizedPhone = normalizePhoneToE164(rawPhone);
      setPhone(normalizedPhone);

      if (!draftId) {
        setErrorKey("missing_draft_id");
        setPhase("error");
        return false;
      }

      if (!isValidE164Phone(normalizedPhone)) {
        setErrorKey("invalid_phone_number");
        setPhase("error");
        return false;
      }

      setErrorKey(null);
      setPhase("sendingOtp");

      try {
        // Drop any stale Firebase auth session before requesting a new OTP;
        // a leftover anonymous session is what makes the second attempt
        // fail with an opaque internal error.
        await signOut(auth).catch(() => undefined);

        const verifier = await ensureFreshRecaptcha();
        confirmationRef.current = await signInWithPhoneNumber(
          auth,
          normalizedPhone,
          verifier
        );
        lastSubmittedPhoneRef.current = normalizedPhone;
        setPhase("otpSent");
        return true;
      } catch (error) {
        setErrorKey(mapFirebaseError(error));
        setPhase("error");
        confirmationRef.current = null;
        // Do not destroy the verifier here — the next sendCode will call
        // ensureFreshRecaptcha() which resets the widget in place.
        return false;
      }
    },
    [auth, draftId, ensureFreshRecaptcha]
  );

  const resendCode = useCallback(async () => {
    return sendCode(lastSubmittedPhoneRef.current || phone);
  }, [phone, sendCode]);

  const verifyCode = useCallback(
    async (otp: string): Promise<RentDraftResponse | null> => {
      const code = otp.trim();
      if (!code) {
        setErrorKey("missing_otp");
        setPhase("error");
        return null;
      }

      if (!draftId || !confirmationRef.current) {
        setErrorKey("unexpected_error");
        setPhase("error");
        return null;
      }

      setErrorKey(null);
      setPhase("verifyingOtp");

      try {
        await confirmationRef.current.confirm(code);
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("Firebase user session not available after OTP.");
        }

        const firebaseIdToken = await currentUser.getIdToken(true);

        setPhase("submittingBackend");
        let response: RentDraftResponse;
        if (mode === "edit") {
          const raw = await rentListingEditService.verifyPhone(draftId, {
            firebaseIdToken,
          });
          // Published edit verify-phone may return an empty payload; fall back
          // to a fresh GET /edit so Redux stays consistent with server truth.
          if (
            raw &&
            typeof raw === "object" &&
            "id" in raw &&
            typeof (raw as RentDraftResponse).id === "string"
          ) {
            response = raw as RentDraftResponse;
          } else {
            response =
              await rentListingEditService.getListingForEdit(draftId);
          }
        } else {
          response = await rentDraftService.verifyPhone(draftId, {
            firebaseIdToken,
          });
        }

        setPhase("verified");
        await signOut(auth).catch(() => undefined);
        setErrorKey(null);
        return response;
      } catch (error) {
        setErrorKey(mapFirebaseError(error));
        setPhase("error");
        return null;
      }
    },
    [auth, draftId, mode]
  );

  const changePhoneNumber = useCallback(() => {
    // Deliberately do NOT clear the reCAPTCHA verifier here — keeping the
    // same verifier alive (and resetting its widget on the next sendCode)
    // is far more reliable than destroying and re-creating it on the same
    // DOM container, which was the source of the "Something went wrong"
    // loop after clicking Change number.
    confirmationRef.current = null;
    setErrorKey(null);
    setPhase("phoneInput");
    signOut(auth).catch(() => undefined);
  }, [auth]);

  const isBusy =
    phase === "sendingOtp" ||
    phase === "verifyingOtp" ||
    phase === "submittingBackend";

  useEffect(() => {
    if (initialVerified) {
      setPhase("verified");
      setErrorKey(null);
    }
  }, [initialVerified]);

  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, [clearRecaptcha]);

  return {
    phase,
    phone,
    setPhone,
    errorKey,
    isBusy,
    sendCode,
    resendCode,
    verifyCode,
    changePhoneNumber,
    resetToInput,
    isValidE164Phone,
    normalizePhoneToE164,
  };
}
