"use client";

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useAppDispatch } from "@/store";
import { logout } from "@/store/slices/authSlice";
import { authService } from "@/lib/api/auth.service";
import { useRouter } from "@/i18n/routing";
import type { ApiError } from "@/types/user";

export function useLogout(): UseMutationResult<void, ApiError, void> {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: () => {
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("nesto_refresh_token")
          : null;
      return authService.logout(refreshToken ?? "");
    },
    onSettled: () => {
      dispatch(logout());
      router.push("/login");
    },
  });
}
