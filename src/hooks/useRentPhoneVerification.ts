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
}

function normalizePhoneToE164(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

function isValidE164Phone(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

function mapFirebaseError(error: unknown): PhoneVerificationErrorKey {
  const code = (error as AuthError | undefined)?.code;

  switch (code) {
    case "auth/invalid-phone-number":
    case "auth/missing-phone-number":
      return "invalid_phone_number";
    case "auth/invalid-verification-code":
      return "invalid_otp";
    case "auth/code-expired":
      return "otp_expired";
    case "auth/too-many-requests":
      return "too_many_requests";
    case "auth/captcha-check-failed":
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
  const lastSubmittedPhoneRef = useRef<string>(initialPhone ?? "");

  const clearRecaptcha = useCallback(() => {
    if (recaptchaRef.current) {
      recaptchaRef.current.clear();
      recaptchaRef.current = null;
    }
  }, []);

  const ensureRecaptcha = useCallback(async () => {
    if (recaptchaRef.current) return recaptchaRef.current;
    recaptchaRef.current = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: "invisible",
    });
    await recaptchaRef.current.render();
    return recaptchaRef.current;
  }, [auth, recaptchaContainerId]);

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
        clearRecaptcha();
        const verifier = await ensureRecaptcha();
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
        return false;
      }
    },
    [auth, clearRecaptcha, draftId, ensureRecaptcha]
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
        const response = await rentDraftService.verifyPhone(draftId, {
          firebaseIdToken,
        });

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
    [auth, draftId]
  );

  const changePhoneNumber = useCallback(() => {
    clearRecaptcha();
    confirmationRef.current = null;
    setErrorKey(null);
    setPhase("phoneInput");
  }, [clearRecaptcha]);

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
