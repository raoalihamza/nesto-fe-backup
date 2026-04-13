"use client";

import { useMutation } from "@tanstack/react-query";
import { useAppDispatch } from "@/store";
import type { AppDispatch } from "@/store";
import { setCredentials, logout } from "@/store/slices/authSlice";
import { authService } from "@/lib/api/auth.service";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { AuthSuccessResponse, ApiError } from "@/types/user";
import { getSafeReturnUrl, isLoginEmailNotVerifiedError } from "@/lib/auth/safeReturnUrl";
import { hydratePendingRentListingFromStorage } from "@/lib/utils/pendingRentListingStorage";
import { ROUTES } from "@/lib/constants/routes";

function completeSocialAuthSuccess(
  dispatch: AppDispatch,
  router: ReturnType<typeof useRouter>,
  data: AuthSuccessResponse,
  returnUrl?: string | null
) {
  if (!data.user.isEmailVerified) {
    dispatch(logout());
    const safe = getSafeReturnUrl(returnUrl ?? null);
    const q = new URLSearchParams();
    q.set("email", data.user.email);
    if (safe) q.set("returnUrl", safe);
    router.push(`/verify-email/request?${q.toString()}`);
    return;
  }

  dispatch(
    setCredentials({
      user: data.user,
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
    })
  );

  const safe = getSafeReturnUrl(returnUrl ?? null);
  const destination = safe ?? ROUTES.OWNER.DASHBOARD;
  if (safe === ROUTES.OWNER.CREATE) {
    hydratePendingRentListingFromStorage(dispatch);
  }
  router.push(destination);
}

function handleSocialAuthError(
  err: { message?: string },
  router: ReturnType<typeof useRouter>,
  returnUrl: string | null | undefined,
  t: (key: string) => string
) {
  const apiErr = err as ApiError;
  if (isLoginEmailNotVerifiedError(apiErr)) {
    const safe = getSafeReturnUrl(returnUrl ?? null);
    const q = new URLSearchParams();
    if (safe) q.set("returnUrl", safe);
    router.push(`/verify-email/request?${q.toString()}`);
    return;
  }
  toast.error(err.message ?? t("socialLoginError"));
}

export function useGoogleSocialLogin(returnUrl?: string | null) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const t = useTranslations("auth");

  return useMutation({
    mutationFn: (idToken: string) => authService.googleLogin(idToken),
    onSuccess: (data) => completeSocialAuthSuccess(dispatch, router, data, returnUrl),
    onError: (err: { message?: string }) =>
      handleSocialAuthError(err, router, returnUrl, t),
  });
}

export function useFacebookSocialLogin(returnUrl?: string | null) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const t = useTranslations("auth");

  return useMutation({
    mutationFn: (accessToken: string) =>
      authService.facebookLogin(accessToken),
    onSuccess: (data) => completeSocialAuthSuccess(dispatch, router, data, returnUrl),
    onError: (err: { message?: string }) =>
      handleSocialAuthError(err, router, returnUrl, t),
  });
}

export function useAppleSocialLogin(returnUrl?: string | null) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const t = useTranslations("auth");

  return useMutation({
    mutationFn: ({
      identityToken,
      firstName,
      lastName,
    }: {
      identityToken: string;
      firstName?: string;
      lastName?: string;
    }) => authService.appleLogin(identityToken, firstName, lastName),
    onSuccess: (data) => completeSocialAuthSuccess(dispatch, router, data, returnUrl),
    onError: (err: { message?: string }) =>
      handleSocialAuthError(err, router, returnUrl, t),
  });
}
