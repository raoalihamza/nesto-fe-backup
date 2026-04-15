"use client";

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useAppDispatch } from "@/store";
import {
  setCredentials,
  setError,
  logout,
} from "@/store/slices/authSlice";
import { authService } from "@/lib/api/auth.service";
import { useRouter } from "@/i18n/routing";
import type { AuthSuccessResponse, ApiError } from "@/types/user";
import { getSafeReturnUrl, isLoginEmailNotVerifiedError } from "@/lib/auth/safeReturnUrl";
import { hydratePendingRentListingFromStorage } from "@/lib/utils/pendingRentListingStorage";
import { setRentCreateIntent } from "@/lib/utils/rentCreateSession";
import { ROUTES } from "@/lib/constants/routes";

export type LoginMutationVariables = {
  email: string;
  password: string;
  returnUrl?: string | null;
};

export function useLogin(): UseMutationResult<
  AuthSuccessResponse,
  ApiError,
  LoginMutationVariables
> {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }) => authService.login(email, password),
    onSuccess: (data, variables) => {
      if (!data.user.isEmailVerified) {
        dispatch(logout());
        const safe = getSafeReturnUrl(variables.returnUrl ?? null);
        const q = new URLSearchParams();
        q.set("email", variables.email);
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

      const safe = getSafeReturnUrl(variables.returnUrl ?? null);
      const destination = safe ?? ROUTES.OWNER.DASHBOARD;

      if (safe === ROUTES.OWNER.CREATE) {
        setRentCreateIntent();
        hydratePendingRentListingFromStorage(dispatch);
      }

      router.push(destination);
    },
    onError: (err, variables) => {
      if (isLoginEmailNotVerifiedError(err)) {
        const safe = getSafeReturnUrl(variables.returnUrl ?? null);
        const q = new URLSearchParams();
        q.set("email", variables.email);
        if (safe) q.set("returnUrl", safe);
        router.push(`/verify-email/request?${q.toString()}`);
        return;
      }
      dispatch(setError(err.message));
    },
  });
}
