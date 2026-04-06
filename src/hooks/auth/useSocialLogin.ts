"use client";

import { useMutation } from "@tanstack/react-query";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/slices/authSlice";
import { authService } from "@/lib/api/auth.service";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function useGoogleSocialLogin() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const t = useTranslations("auth");

  return useMutation({
    mutationFn: (idToken: string) => authService.googleLogin(idToken),
    onSuccess: (data) => {
      dispatch(
        setCredentials({
          user: data.user,
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
        })
      );
      router.push("/dashboard");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? t("socialLoginError"));
    },
  });
}

export function useFacebookSocialLogin() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const t = useTranslations("auth");

  return useMutation({
    mutationFn: (accessToken: string) =>
      authService.facebookLogin(accessToken),
    onSuccess: (data) => {
      dispatch(
        setCredentials({
          user: data.user,
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
        })
      );
      router.push("/dashboard");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? t("socialLoginError"));
    },
  });
}
